<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Votre inscription a été validée</title>
</head>

<body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4;">
    <div
        style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
        <h1 style="color: #333; font-size: 24px; margin-bottom: 20px;">Bienvenue, {{ $student->first_name }}
            {{ $student->last_name }} !</h1>
        <p style="color: #666; font-size: 16px; line-height: 1.5;">Votre inscription à l'Auto-École a été validée avec
            succès.</p>
        <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Veuillez compléter vos informations en vous connectant ici :
            <a href="{{ $loginUrl }}" style="color: #1a73e8; text-decoration: none;">{{ $loginUrl }}</a>
        </p>
        <p style="color: #666; font-size: 16px; margin-top: 20px;">Cordialement,<br>L’équipe Auto-École</p>
    </div>
</body>

</html>