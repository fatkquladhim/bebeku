# BEBEKU Deployment Checklist - Neon PostgreSQL on Vercel

## 1. Environment Variables

Add to Vercel Dashboard → Project Settings → Environment Variables:

```
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require
```

**Get from:** https://console.neon.tech → Connection String → " pooled connection"

## 2. Install Dependencies

```bash
cd bebeku
npm install
```

## 3. Run Database Migration

```bash
# Set env locally first (optional, for testing)
export DATABASE_URL="your-neon-connection-string"

# Apply migration
npx drizzle-kit migrate
```

Or run SQL directly in Neon SQL Editor:
- Copy contents of [`drizzle/0000_initial.sql`](drizzle/0000_initial.sql)
- Paste in Neon Console → SQL Editor → Run

## 4. Deploy to Vercel

```bash
vercel --prod
```

Or connect GitHub repo to Vercel for auto-deploy.

## 5. Verify Deployment

- [ ] Dashboard loads without errors
- [ ] Can create a barn
- [ ] Can create a batch
- [ ] Database records persist after redeploy

---

## Why SQLITE_CANTOPEN Happens

| Cause | Explanation |
|-------|-------------|
| **File system read-only** | Vercel's filesystem is read-only except `/tmp` |
| **SQLite file path** | `./sqlite.db` doesn't exist on serverless |
| **Cold start** | New instance = new filesystem = lost database |
| **Multi-region** | Each region has separate filesystem |

**Solution:** Use Neon PostgreSQL (serverless-native, persistent, pooled connections).

---

## Connection Pooling Notes

Neon connection string already includes pooling. For high traffic, use:
```
postgresql://.../dbname?sslmode=require&connection_limit=10
```

## Troubleshooting

| Error | Fix |
|-------|-----|
| `ERR_MODULE_NOT_FOUND` | Run `npm install` |
| `DATABASE_URL is undefined` | Check env var in Vercel dashboard |
| `connection refused` | Check Neon project is active |
| `relation does not exist` | Run migration first |