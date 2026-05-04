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
            background: linear-gradient(135deg, #010066 0%, #000033 50%, #010066 100%);
            position: relative;
            overflow: hidden;
        }

        body::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle at 30% 70%, rgba(255,255,255,0.03) 0%, transparent 50%),
                        radial-gradient(circle at 70% 30%, rgba(255,255,255,0.05) 0%, transparent 40%);
            pointer-events: none;
        }

        .login-container {
            width: 100%;
            max-width: 480px;
            padding: 0 24px;
        }

        .login-card {
            background: rgba(255, 255, 255, 0.92);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-radius: 24px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 25px 80px rgba(0, 0, 0, 0.25),
                        0 10px 30px rgba(1, 0, 102, 0.15),
                        inset 0 1px 0 rgba(255, 255, 255, 0.6);
            padding: 32px 36px;
            position: relative;
        }

        .login-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 20px;
            right: 20px;
            height: 4px;
            background: linear-gradient(90deg, transparent, #eb3505, #010066, transparent);
            border-radius: 0 0 4px 4px;
            opacity: 0.6;
        }

        .logo-section {
            text-align: center;
            margin-bottom: 24px;
        }

        .logo-wrapper {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, rgba(1, 0, 102, 0.08) 0%, rgba(235, 53, 5, 0.05) 100%);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 14px;
            box-shadow: 0 4px 20px rgba(1, 0, 102, 0.15),
                        inset 0 1px 0 rgba(255, 255, 255, 0.8);
            padding: 14px;
            border: 1px solid rgba(1, 0, 102, 0.1);
        }

        .logo-wrapper img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            filter: drop-shadow(0 2px 4px rgba(1, 0, 102, 0.1));
        }

        .app-title {
            font-size: 22px;
            font-weight: 600;
            color: #010066;
            letter-spacing: -0.3px;
        }

        .app-subtitle {
            font-size: 13px;
            color: #6b7280;
            margin-top: 6px;
            font-weight: 500;
        }

        .government-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 11px;
            color: #8e8e93;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 8px;
            padding: 4px 10px;
            background: rgba(1, 0, 102, 0.05);
            border-radius: 20px;
            border: 1px solid rgba(1, 0, 102, 0.1);
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-label {
            display: block;
            font-size: 13px;
            font-weight: 500;
            color: #3a3a3c;
            margin-bottom: 8px;
            padding-left: 4px;
        }

        .input-wrapper {
            position: relative;
        }

        .form-input {
            width: 100%;
            padding: 12px 14px;
            font-size: 15px;
            border: 1px solid rgba(0, 0, 0, 0.08);
            border-radius: 12px;
            background: white;
            outline: none;
            transition: all 0.2s ease;
            font-family: inherit;
            height: 44px;
        }

        .form-input:focus {
            border-color: #010066;
            box-shadow: 0 0 0 3px rgba(1, 0, 102, 0.15);
        }

        .input-icon {
            position: absolute;
            left: 14px;
            top: 50%;
            transform: translateY(-50%);
            color: #c7c7cc;
            font-size: 16px;
        }

        .form-input.with-icon {
            padding-left: 40px;
        }

        .error-message {
            display: flex;
            align-items: center;
            gap: 6px;
            color: #ff3b30;
            font-size: 13px;
            margin-top: 6px;
            padding-left: 4px;
        }

        .remember-section {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 24px;
            padding-left: 4px;
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
            border: 2px solid #c7c7cc;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        }

        .checkbox-wrapper input[type="checkbox"]:checked + .checkbox-custom {
            background: #010066;
            border-color: #010066;
        }

        .checkbox-custom i {
            color: white;
            font-size: 11px;
            opacity: 0;
            transition: opacity 0.2s ease;
        }

        .checkbox-wrapper input[type="checkbox"]:checked + .checkbox-custom i {
            opacity: 1;
        }

        .remember-label {
            font-size: 14px;
            color: #3a3a3c;
            cursor: pointer;
        }

        .login-button {
            width: 100%;
            padding: 13px;
            font-size: 15px;
            font-weight: 600;
            color: white;
            background: linear-gradient(135deg, #010066 0%, #000033 100%);
            border: none;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: inherit;
            box-shadow: 0 4px 14px rgba(1, 0, 102, 0.3);
            height: 48px;
        }

        .login-button:hover {
            background: linear-gradient(135deg, #000055 0%, #000022 100%);
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(1, 0, 102, 0.4);
        }

        .login-button:active {
            transform: translateY(0);
            box-shadow: 0 2px 8px rgba(1, 0, 102, 0.3);
        }

        .public-button {
            width: 100%;
            padding: 12px;
            font-size: 14px;
            font-weight: 500;
            color: #010066;
            background: rgba(1, 0, 102, 0.06);
            border: 1px solid rgba(1, 0, 102, 0.15);
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: inherit;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-top: 10px;
        }

        .public-button:hover {
            background: rgba(1, 0, 102, 0.12);
            border-color: rgba(1, 0, 102, 0.25);
        }

        .public-button i {
            font-size: 13px;
        }

        .default-credentials {
            margin-top: 24px;
            padding: 16px;
            background: rgba(0, 122, 255, 0.08);
            border-radius: 12px;
            border: 1px solid rgba(0, 122, 255, 0.15);
        }

        .default-credentials-title {
            font-size: 12px;
            font-weight: 600;
            color: #007aff;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }

        .credential-row {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            color: #3a3a3c;
            margin-bottom: 4px;
        }

        .credential-label {
            color: #8e8e93;
        }

        .credential-value {
            font-family: 'SF Mono', monospace;
            font-weight: 500;
            color: #007aff;
        }

        @media (max-width: 480px) {
            .login-card {
                padding: 32px 24px;
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
                    <i class="fas fa-shield-alt" style="color: #eb3505;"></i>
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
                            class="form-input with-icon"
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
                            class="form-input with-icon"
                            placeholder="Enter password"
                            required
                        >
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
</body>
</html>
