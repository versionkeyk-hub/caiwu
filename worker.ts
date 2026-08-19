import { INITIAL_ACCOUNTS, INITIAL_BUDGETS, INITIAL_TRANSACTIONS, INITIAL_HISTORICAL_SNAPSHOTS } from './src/data/initialData';

// Cloudflare Worker ambient types for build verification
type D1Database = any;
type R2Bucket = any;
type Fetcher = any;
type ExecutionContext = any;

export interface Env {
  DB: D1Database;
  R2_BUCKET: R2Bucket;
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // 跨域 CORS 支持
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // 1. 获取全量财务数据 (从 D1 读取，按用户隔离)
    if (url.pathname === '/api/finance' && request.method === 'GET') {
      try {
        const queryEmail = (url.searchParams.get('email') || '').trim().toLowerCase();
        const stateId = (queryEmail === 'version.keyk@gmail.com' || queryEmail === 'owner' || !queryEmail) 
          ? 'primary_state' 
          : `user_${queryEmail.replace(/[^a-zA-Z0-9_]/g, '_')}`;

        const row = await env.DB.prepare(
          'SELECT data_json, updated_at FROM finance_state WHERE id = ?'
        ).bind(stateId).first();

        if (row && row.data_json) {
          const parsed = JSON.parse(row.data_json as string);
          return Response.json({
            success: true,
            source: 'd1',
            updatedAt: row.updated_at,
            data: parsed,
          }, {
            headers: { 'Access-Control-Allow-Origin': '*' }
          });
        }

        // D1 初始无数据时，根据账号身份生成种子
        const isOwner = (stateId === 'primary_state');
        const initialPayload = isOwner ? {
          accounts: INITIAL_ACCOUNTS,
          transactions: INITIAL_TRANSACTIONS,
          budgets: INITIAL_BUDGETS,
          snapshots: INITIAL_HISTORICAL_SNAPSHOTS,
          monthlySalary: 11250,
          currentMonth: '2026-08',
          userProfile: {
            name: '理财官',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          },
        } : {
          accounts: INITIAL_ACCOUNTS.map(a => ({ ...a, balance: 0 })),
          transactions: [],
          budgets: INITIAL_BUDGETS,
          snapshots: [],
          monthlySalary: 0,
          currentMonth: '2026-08',
          userProfile: {
            name: queryEmail.split('@')[0] || '新用户',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          },
        };

        await env.DB.prepare(
          `INSERT INTO finance_state (id, user_name, user_avatar, data_json, updated_at)
           VALUES (?, ?, ?, ?, datetime('now'))
           ON CONFLICT(id) DO UPDATE SET data_json=excluded.data_json, updated_at=datetime('now')`
        ).bind(stateId, initialPayload.userProfile.name, initialPayload.userProfile.avatar, JSON.stringify(initialPayload)).run();

        return Response.json({
          success: true,
          source: 'd1_seeded',
          data: initialPayload,
        }, {
          headers: { 'Access-Control-Allow-Origin': '*' }
        });
      } catch (err: any) {
        return Response.json({ success: false, error: err.message }, { status: 500 });
      }
    }

    // 2. 保存/同步财务数据到 D1 数据库 (按用户隔离)
    if (url.pathname === '/api/finance' && request.method === 'POST') {
      try {
        const body = await request.json() as any;
        const jsonStr = JSON.stringify(body);
        const userEmail = (body.userProfile?.email || '').trim().toLowerCase();
        const stateId = (userEmail === 'version.keyk@gmail.com' || userEmail === 'owner' || !userEmail)
          ? 'primary_state'
          : `user_${userEmail.replace(/[^a-zA-Z0-9_]/g, '_')}`;

        const userName = body.userProfile?.name || '理财官';
        const userAvatar = body.userProfile?.avatar || '';

        await env.DB.prepare(
          `INSERT INTO finance_state (id, user_name, user_avatar, data_json, updated_at)
           VALUES (?, ?, ?, ?, datetime('now'))
           ON CONFLICT(id) DO UPDATE SET 
             user_name=excluded.user_name,
             user_avatar=excluded.user_avatar,
             data_json=excluded.data_json,
             updated_at=datetime('now')`
        ).bind(stateId, userName, userAvatar, jsonStr).run();

        return Response.json({ success: true, message: 'D1 数据库已实时同步保存', stateId }, {
          headers: { 'Access-Control-Allow-Origin': '*' }
        });
      } catch (err: any) {
        return Response.json({ success: false, error: err.message }, { status: 500 });
      }
    }

    // 3. 上传票据/文件到 R2 存储桶
    if (url.pathname === '/api/upload' && request.method === 'POST') {
      try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        if (!file) {
          return Response.json({ success: false, error: '未提供上传文件' }, { status: 400 });
        }

        const ext = file.name.split('.').pop() || 'bin';
        const fileKey = `receipts/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
        const arrayBuffer = await file.arrayBuffer();

        await env.R2_BUCKET.put(fileKey, arrayBuffer, {
          httpMetadata: {
            contentType: file.type || 'application/octet-stream',
          },
          customMetadata: {
            originalName: encodeURIComponent(file.name),
            uploadedAt: new Date().toISOString(),
          },
        });

        const fileUrl = `/api/r2/${fileKey}`;
        return Response.json({
          success: true,
          key: fileKey,
          url: fileUrl,
          name: file.name,
          size: file.size,
          type: file.type,
        }, {
          headers: { 'Access-Control-Allow-Origin': '*' }
        });
      } catch (err: any) {
        return Response.json({ success: false, error: err.message }, { status: 500 });
      }
    }

    // 4. 从 R2 存储桶读取/预览文件
    if (url.pathname.startsWith('/api/r2/')) {
      const fileKey = decodeURIComponent(url.pathname.replace('/api/r2/', ''));
      try {
        const object = await env.R2_BUCKET.get(fileKey);
        if (!object) {
          return new Response('文件未在 R2 存储桶中找到', { status: 404 });
        }

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);
        headers.set('Cache-Control', 'public, max-age=31536000');
        headers.set('Access-Control-Allow-Origin', '*');

        return new Response(object.body, { headers });
      } catch (err: any) {
        return new Response(err.message, { status: 500 });
      }
    }

    // 5. 其余请求回退到前端 Assets (SPA 静态托管)
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not found', { status: 404 });
  },
};
