<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DPWH Employee Directory - Public View</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/public.jsx'])
</head>
<body class="bg-gray-100 min-h-screen">
    <div id="public-root">
        <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f9fafb;">
            <div style="text-align:center;">
                <div style="width:60px;height:60px;margin:0 auto 16px;border:3px solid #e5e7eb;border-top-color:#007aff;border-radius:50%;animation:spin 1s linear infinite;"></div>
                <p style="color:#6b7280;font-size:14px;">Loading Employee Directory...</p>
            </div>
        </div>
    </div>
    <noscript>
        <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f9fafb;">
            <div style="text-align:center;color:#1f2937;">
                <h1 style="font-size:24px;margin-bottom:8px;">JavaScript Required</h1>
                <p style="color:#6b7280;">Please enable JavaScript to view the Employee Directory.</p>
            </div>
        </div>
    </noscript>
    <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
</body>
</html>
