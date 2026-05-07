<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Login - Service Profiling System</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(1, 0, 102, 0.05);
        }

        .login-container {
            width: 100%;
            max-width: 480px;
            padding: 24px;
        }

        .login-card {
            background: #ffffff;
            border-radius: 20px;
            padding: 24px 32px;
            box-shadow: 0 4px 24px rgba(1, 0, 102, 0.1);
            border: 1px solid rgba(1, 0, 102, 0.08);
        }

        .logo-section {
            text-align: center;
            margin-bottom: 16px;
        }

        .logo-wrapper {
            width: 56px;
            height: 56px;
            background: #ffffff;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 8px;
            padding: 10px;
            box-shadow: 0 2px 8px rgba(0, 119, 182, 0.1);
        }

        .logo-wrapper img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }

        .app-title {
            font-size: 18px;
            font-weight: 600;
            color: #010066;
        }

        .app-subtitle {
            font-size: 12px;
            color: #64748b;
            margin-top: 2px;
        }

        .government-badge {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            font-size: 10px;
            color: #010066;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 6px;
            padding: 4px 10px;
            background: rgba(1, 0, 102, 0.05);
            border-radius: 20px;
            border: 1px solid rgba(1, 0, 102, 0.15);
        }

        .form-group {
            margin-bottom: 14px;
        }

        .form-label {
            display: block;
            font-size: 14px;
            font-weight: 500;
            color: #334155;
            margin-bottom: 8px;
        }

        .input-wrapper {
            position: relative;
        }

        .form-input {
            width: 100%;
            padding: 12px 12px 12px 40px;
            font-size: 14px;
            border: 2px solid rgba(1, 0, 102, 0.1);
            border-radius: 10px;
            background: #ffffff;
            outline: none;
            transition: all 0.2s ease;
            font-family: inherit;
            height: 44px;
        }

        .form-input.password-field {
            padding-right: 40px;
        }

        .form-input:focus {
            border-color: #010066;
            box-shadow: 0 0 0 4px rgba(1, 0, 102, 0.1);
        }

        .form-input::placeholder {
            color: #94a3b8;
        }

        .input-icon {
            position: absolute;
            left: 14px;
            top: 50%;
            transform: translateY(-50%);
            color: #010066;
            font-size: 14px;
        }

        .password-toggle {
            position: absolute;
            right: 14px;
            top: 50%;
            transform: translateY(-50%);
            color: #010066;
            font-size: 14px;
            cursor: pointer;
            background: none;
            border: none;
            padding: 4px;
            opacity: 0.6;
            transition: opacity 0.2s ease;
        }

        .password-toggle:hover {
            opacity: 1;
        }

        .error-message {
            display: flex;
            align-items: center;
            gap: 6px;
            color: #dc2626;
            font-size: 13px;
            margin-top: 6px;
            background: #fef2f2;
            padding: 8px 12px;
            border-radius: 8px;
            border: 1px solid #fecaca;
        }

        .remember-section {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 16px;
        }

        .checkbox-wrapper {
            position: relative;
            width: 20px;
            height: 20px;
        }

        .checkbox-wrapper input[type="checkbox"] {
            position: absolute;
            opacity: 0;
            width: 100%;
            height: 100%;
            cursor: pointer;
        }

        .checkbox-custom {
            width: 20px;
            height: 20px;
            border: 2px solid #cbd5e1;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            background: #ffffff;
        }

        .checkbox-wrapper input[type="checkbox"]:checked + .checkbox-custom {
            background: #010066;
            border-color: #010066;
        }

        .checkbox-custom i {
            color: #ffffff;
            font-size: 11px;
            opacity: 0;
            transition: opacity 0.2s ease;
        }

        .checkbox-wrapper input[type="checkbox"]:checked + .checkbox-custom i {
            opacity: 1;
        }

        .remember-label {
            font-size: 14px;
            color: #475569;
            cursor: pointer;
        }

        .login-button {
            width: 100%;
            padding: 12px;
            font-size: 14px;
            font-weight: 600;
            color: #ffffff;
            background: linear-gradient(135deg, #010066 0%, #000044 100%);
            border: none;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: inherit;
            height: 44px;
            box-shadow: 0 4px 14px rgba(1, 0, 102, 0.3);
        }

        .login-button:hover {
            background: linear-gradient(135deg, #000055 0%, #000033 100%);
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(1, 0, 102, 0.4);
        }

        .login-button:active {
            transform: translateY(0);
        }

        .public-button {
            width: 100%;
            padding: 10px;
            font-size: 13px;
            font-weight: 500;
            color: #010066;
            background: rgba(1, 0, 102, 0.05);
            border: 2px solid rgba(1, 0, 102, 0.15);
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: inherit;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            margin-top: 10px;
        }

        .public-button:hover {
            background: rgba(1, 0, 102, 0.1);
            border-color: rgba(1, 0, 102, 0.25);
        }

        .public-button i {
            font-size: 13px;
        }

        @media (max-width: 480px) {
            .login-card {
                padding: 28px 24px;
            }
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="login-card">
            <div class="logo-section">
                <div class="logo-wrapper">
                    <img src="/assets/images/DPWH_Logo.png" alt="DPWH Logo">
                </div>
                <h1 class="app-title">Service Profiling System</h1>
                <p class="app-subtitle">Department of Public Works and Highways</p>
                <div class="government-badge">
                    <i class="fas fa-shield-alt"></i>
                    <span>Government Service</span>
                </div>
            </div>

            <form method="POST" action="{{ route('login') }}">
                @csrf

                <div class="form-group">
                    <label class="form-label" for="username">Username</label>
                    <div class="input-wrapper">
                        <i class="fas fa-user input-icon"></i>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            class="form-input"
                            placeholder="Enter username"
                            value="{{ old('username') }}"
                            required
                            autofocus
                        >
                    </div>
                    @error('username')
                        <div class="error-message">
                            <i class="fas fa-exclamation-circle"></i>
                            <span>{{ $message }}</span>
                        </div>
                    @enderror
                </div>

                <div class="form-group">
                    <label class="form-label" for="password">Password</label>
                    <div class="input-wrapper">
                        <i class="fas fa-lock input-icon"></i>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            class="form-input password-field"
                            placeholder="Enter password"
                            required
                        >
                        <button type="button" class="password-toggle" onclick="togglePassword()">
                            <i class="fas fa-eye" id="toggleIcon"></i>
                        </button>
                    </div>
                    @error('password')
                        <div class="error-message">
                            <i class="fas fa-exclamation-circle"></i>
                            <span>{{ $message }}</span>
                        </div>
                    @enderror
                </div>

                <div class="remember-section">
                    <div class="checkbox-wrapper">
                        <input type="checkbox" name="remember" id="remember" {{ old('remember') ? 'checked' : '' }}>
                        <div class="checkbox-custom">
                            <i class="fas fa-check"></i>
                        </div>
                    </div>
                    <label for="remember" class="remember-label">Remember me</label>
                </div>

                <button type="submit" class="login-button">
                    Sign In
                </button>
            </form>

            <a href="/public" class="public-button">
                <i class="fas fa-users"></i>
                View Employee Directory
            </a>
        </div>
    </div>

    <script>
        function togglePassword() {
            const passwordInput = document.getElementById('password');
            const toggleIcon = document.getElementById('toggleIcon');

            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                toggleIcon.classList.remove('fa-eye');
                toggleIcon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                toggleIcon.classList.remove('fa-eye-slash');
                toggleIcon.classList.add('fa-eye');
            }
        }
    </script>
</body>
</html>
