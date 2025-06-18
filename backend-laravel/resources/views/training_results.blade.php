<!DOCTYPE html>
<html>

<head>
    <title>Résultats de votre formation</title>
</head>

<body>
    <h1>Bonjour {{ $student->first_name }} {{ $student->last_name }},</h1>
    <p>Vos résultats pour la formation sont disponibles :</p>

    <h2>Résultats des examens</h2>
    <ul>
        @foreach ($results['results'] as $result)
            <li>Examen #{{ $result['exam_id'] }} : {{ $result['score'] }} - {{ $result['passed'] ? 'Réussi' : 'Échoué' }}
            </li>
        @endforeach
    </ul>

    <h2>Résultat final</h2>
    <p>Votre résultat final est : <strong>{{ $results['final_result'] }}</strong></p>

    <p>Merci de votre participation !</p>
</body>

</html>