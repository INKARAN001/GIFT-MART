# Deploy GIFT MART

## Deploy frontend (website) in a few minutes

### Option 1: Vercel (recommended)

1. **Create an account**  
   Go to [vercel.com](https://vercel.com) → Sign up (free, with GitHub/Google/Email).

2. **Install Vercel CLI** (one time, in terminal):
   ```bash
   npm install -g vercel
   ```

3. **Deploy from the frontend folder**:
   ```bash
   cd "C:\Users\karan\Desktop\GIFT MART\frontend"
   npm run build
   vercel
   ```
   - First time: log in when asked.
   - “Set up and deploy?” → **Y**
   - “Which scope?” → press Enter (your account).
   - “Link to existing project?” → **N**
   - “Project name?” → press Enter (e.g. `gift-mart`) or type a name.
   - “In which directory is your code?” → press Enter (current directory).
   - Vercel will build and give you a URL like:  
     **https://gift-mart-xxxx.vercel.app**

4. **Share that URL** with your client.

---

### Option 2: Netlify (drag and drop)

1. **Build the site on your PC**:
   ```bash
   cd "C:\Users\karan\Desktop\GIFT MART\frontend"
   npm run build
   ```
   This creates the `dist` folder.

2. **Deploy**  
   - Go to [app.netlify.com](https://app.netlify.com) → Sign up / Log in.  
   - **Add new site** → **Deploy manually**.  
   - Drag the **`dist`** folder (inside `frontend`) into the drop zone.  
   - Netlify will give you a link like **https://random-name-123.netlify.app**.

3. **Share that link** with your client.

---

## Notes

- **Backend (Java API):** The live site uses mock/static data for the product list on the home page. Login, product details from API, and admin need the backend running. To have full functionality online, you’d deploy the Java backend separately (e.g. Render, Railway) and set the API URL in the frontend.
- **Video:** The hero uses `Beige Simple Welcome Video.mp4` from `frontend/public`. It’s included in the build and will work on the deployed site.
- **Custom domain:** In Vercel or Netlify you can add your own domain in the project settings.
