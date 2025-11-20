# 🔐 Admin Panel Access Guide

## ✅ SETUP COMPLETE!

Your admin panel is now fully configured and ready to use!

---

## 📍 Access Information

### **Frontend Admin Panel (React)**
**URL:** `http://localhost:5173/admin`

### **Backend API**
**URL:** `http://localhost:8000/api/v1`

### **Orchid Admin Panel (Optional - Browser-based)**
**URL:** `http://localhost:8000/admin`

---

## 🔑 Admin Login Credentials

### **Email:** `admin@admin.com`
### **Password:** `password`

---

## 🚀 How to Access the Admin Panel

### Step 1: Start the Servers

**Terminal 1 - Laravel API:**
```bash
php artisan serve
```
This starts the backend API on: `http://localhost:8000`

**Terminal 2 - React Frontend:**
```bash
npm run dev
```
This starts the React app on: `http://localhost:5173`

### Step 2: Login

1. Open your browser and go to: `http://localhost:5173/login`
2. Enter credentials:
   - Email: `admin@admin.com`
   - Password: `password`
3. Click "Sign in"

### Step 3: Access Admin Dashboard

After successful login, navigate to: `http://localhost:5173/admin`

---

## 🎯 Available Admin Pages

| Page | URL | Description |
|------|-----|-------------|
| **Dashboard** | `/admin` | Overview with statistics |
| **Users** | `/admin/users` | Manage all users |
| **Businesses** | `/admin/businesses` | Manage businesses |
| **Videos** | `/admin/videos` | Moderate videos |
| **Products** | `/admin/products` | Manage products |

---

## 🛠️ Admin Features

### ✅ Dashboard
- View total users, businesses, videos, products
- Quick action buttons
- Statistics overview

### ✅ User Management
- View all users (normal, business, admin)
- Filter and search users
- Activate/deactivate accounts
- View user details

### ✅ Business Management
- View all registered businesses
- Activate/deactivate businesses
- Verify/unverify businesses
- View business details

### ✅ Video Management
- View all uploaded videos
- Delete inappropriate videos
- View video statistics (views, likes, comments)
- Moderate content

### ✅ Product Management
- View all products
- Delete products
- Monitor stock levels
- View product details

---

## 🔄 Architecture Overview

```
┌─────────────────────────────────────┐
│   React Frontend (Port 5173)        │
│   http://localhost:5173             │
│                                     │
│   • Login Page                      │
│   • Admin Dashboard                 │
│   • User Management                 │
│   • Business Management             │
│   • Video Management                │
│   • Product Management              │
└──────────────┬──────────────────────┘
               │
               │ API Calls (Axios)
               ↓
┌─────────────────────────────────────┐
│   Laravel API (Port 8000)           │
│   http://localhost:8000/api/v1      │
│                                     │
│   • Authentication (Sanctum)        │
│   • Admin API Endpoints             │
│   • Business Logic                  │
│   • Database Operations             │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│   MySQL Database                    │
│   barber_social                     │
└─────────────────────────────────────┘
```

---

## 🔐 Authentication Flow

1. **User logs in** via React form (`/login`)
2. **React sends credentials** to Laravel API (`POST /api/auth/login`)
3. **Laravel validates** credentials and returns:
   - User object (with `user_type: 'admin'`)
   - Sanctum token
4. **React stores** token in localStorage
5. **React checks** `user_type` before rendering admin pages
6. **All subsequent API calls** include the token in headers

---

## 🚨 Troubleshooting

### Problem: Redirected to Login

**Solution:**
1. Make sure you're logged in with admin credentials
2. Check browser console for errors
3. Verify token exists in localStorage (F12 > Application > Local Storage)

### Problem: "Access Denied"

**Solution:**
- Only users with `user_type: 'admin'` can access `/admin` routes
- Make sure you logged in with `admin@admin.com`

### Problem: API Errors

**Solution:**
1. Check Laravel server is running (`php artisan serve`)
2. Check database connection in `.env`
3. Look at Laravel logs: `storage/logs/laravel.log`

### Problem: Frontend Not Loading

**Solution:**
1. Check React dev server is running (`npm run dev`)
2. Check for errors in terminal
3. Try `npm install` to reinstall dependencies

---

## 📝 Create Additional Admin Users

To create more admin users, you can either:

### Option 1: Via Database Seeder
Create a new seeder or update `AdminUserSeeder.php`

### Option 2: Via Tinker
```bash
php artisan tinker
```
```php
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

User::create([
    'uuid' => Str::uuid(),
    'user_type' => 'admin',
    'first_name' => 'John',
    'last_name' => 'Admin',
    'email' => 'john@admin.com',
    'password' => Hash::make('password123'),
    'email_verified_at' => now(),
    'is_active' => true,
    'permissions' => [
        'platform.systems.roles' => true,
        'platform.systems.users' => true,
    ],
]);
```

---

## 🎨 Next Steps

1. ✅ Login to admin panel
2. ✅ Test all admin pages
3. ⏭️ Customize admin dashboard as needed
4. ⏭️ Add more admin features
5. ⏭️ Build the mobile app (Flutter)

---

## 📞 Need Help?

If you encounter any issues:
1. Check Laravel logs: `storage/logs/laravel.log`
2. Check browser console (F12)
3. Check network tab for API errors
4. Verify database connection

---

**Your admin panel is ready! 🎉**

Login at: `http://localhost:5173/login`
Admin email: `admin@admin.com`
Password: `password`
