---
name: cloudflare-r2-object-storage
description: >-
  Architects, configures, and integrates Cloudflare R2 zero-egress object storage using S3-compatible APIs, pre-signed upload URLs, multipart streaming, and edge CDN distribution.
---

# Cloudflare R2 Object Storage & Edge Distribution

This skill guides the implementation of zero-egress fee object storage using Cloudflare R2 with S3-compatible APIs, pre-signed URLs, multipart uploads, and edge CDN distribution.

---

## ⚡ Architectural Comparison: R2 vs Standard S3

| Feature | Cloudflare R2 | Standard AWS S3 |
| :--- | :--- | :--- |
| **Data Egress Fees** | **$0.00 / GB (Free)** | ~$0.09 / GB |
| **API Compatibility** | Full S3 API v4 signature | Native AWS S3 |
| **Edge Integration** | Native Cloudflare Workers & CDN | CloudFront integration required |
| **Storage Pricing** | $0.015 / GB-month | $0.023 / GB-month |
| **Global Replication** | Automatic across edge locations | Cross-Region Replication (CRR) billed |

---

## 🛠️ TypeScript S3 Client Configuration (`@aws-sdk/client-s3`)

R2 endpoints use account-specific URLs with AWS Signature Version 4:

```typescript
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});
```

---

## 📤 Pre-Signed URLs for Direct Browser Uploads

Prevent API server bottlenecking by generating short-lived pre-signed upload URLs:

```typescript
export async function generateUploadUrl(key: string, contentType: string, expiresInSeconds = 300) {
  const command = new PutObjectCommand({
    Bucket: 'enterprise-artifacts',
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: expiresInSeconds });
  return {
    uploadUrl,
    key,
    publicUrl: `https://cdn.example.com/${key}`,
  };
}
```

---

## 📦 High-Throughput Multipart Uploads (Node.js / Python)

For files exceeding 100MB, use parallel multipart uploads with the Upload helper:

```typescript
import { Upload } from '@aws-sdk/lib-storage';
import fs from 'node:fs';

export async function uploadLargeArchive(filePath: string, destinationKey: string) {
  const fileStream = fs.createReadStream(filePath);
  
  const parallelUpload = new Upload({
    client: r2Client,
    params: {
      Bucket: 'enterprise-artifacts',
      Key: destinationKey,
      Body: fileStream,
      ContentType: 'application/octet-stream',
    },
    queueSize: 4,          // 4 concurrent part uploads
    partSize: 10 * 1024 * 1024, // 10MB chunk size
    leavePartsOnError: false,
  });

  parallelUpload.on('httpUploadProgress', (progress) => {
    console.log(`Uploaded ${progress.loaded} of ${progress.total} bytes`);
  });

  return await parallelUpload.done();
}
```

---

## 🌐 Custom Domain & Cloudflare CDN Caching Rule

Expose R2 buckets through a custom domain with edge cache headers:

```javascript
// Cloudflare Worker Edge Proxy
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const key = url.pathname.slice(1);

    if (request.method !== 'GET') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const object = await env.MY_R2_BUCKET.get(key);
    if (!object) {
      return new Response('Not Found', { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    return new Response(object.body, { headers });
  },
};
```

---

## 📋 Architectural Rules & Best Practices

1. **Bucket Region**: Always set region to `auto` in AWS S3 SDK clients; R2 automatically routes storage to the lowest-latency regional cluster.
2. **CORS Headers**: Set permissive CORS rules (`AllowedOrigins`, `AllowedMethods: ["PUT", "GET"]`) on the R2 bucket for direct browser pre-signed uploads.
3. **Multipart Cleanup**: Configure bucket lifecycle rules to automatically abort incomplete multipart uploads after 7 days (`AbortIncompleteMultipartUpload`).
4. **Zero-Egress Strategy**: Route public media and file downloads through Cloudflare Custom Domains or Workers to benefit from zero bandwidth charges.
