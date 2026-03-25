# XS Utopia — Deploy Ready

這個版本可直接部署到 **GitHub Pages** 或 **Vercel**。

## 結構
- `index.html`：首頁
- `node.html`：Node 頁
- `about.html`：理念頁
- `charter.html`：憲章頁
- `assets/`：CSS / JS / 圖片
- `vercel.json`：Vercel 靜態部署設定
- `.nojekyll`：GitHub Pages 相容
- `api-example/serverless-openai.js`：AI 後端範例

## GitHub Pages 部署
1. 建立新的 GitHub repository
2. 把這個資料夾內所有檔案上傳到 repo 根目錄
3. 到 GitHub → Settings → Pages
4. Source 選 `Deploy from a branch`
5. Branch 選 `main`，Folder 選 `/ (root)`
6. 儲存後等待部署完成

首頁：
- `/index.html`
其他頁面：
- `/node.html`
- `/about.html`
- `/charter.html`

## Vercel 部署
### 方法 A：直接拖曳
1. 到 Vercel
2. 建立新專案
3. 把整個資料夾拖上去
4. 直接部署即可

### 方法 B：GitHub 連接
1. 把這包上傳到 GitHub repo
2. 在 Vercel 匯入該 repo
3. Framework Preset 選 `Other`
4. 不需要 build command
5. Output Directory 留空
6. 直接部署

## AI Chat 串接
前端已可直接接你的 API endpoint，但**正式版不要把 OpenAI API key 放在前端**。

建議架構：
- 前端：打你自己的 `/api/xs-navigator`
- 後端：再去呼叫 OpenAI API

前端預期回傳格式：
```json
{ "reply": "XS Navigator 的回覆內容" }
```

`api-example/serverless-openai.js` 提供了一個可改寫的 serverless 範例。

## 上線前建議修改
- Instagram 連結
- Email
- Node 內商品與品牌文字
- AI endpoint
- SEO title / description / OG 圖


## 已填入正式資料
- Instagram：https://www.instagram.com/yaochung?igsh=MW9wZ2lla2t4em5oNA%3D%3D&utm_source=qr
- Email：tyascg@gmail.com
- 預設 AI endpoint：/api/xs-navigator

