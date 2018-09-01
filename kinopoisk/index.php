<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header("Access-Control-Allow-Headers: X-Requested-With");
header('Content-type: application/json');

if (version_compare(phpversion(), '7.1', '>=')) {
    ini_set('serialize_precision', -1);
}

$kId = $_GET["kid"];
$kId = preg_replace("/[^0-9]/", "", $kId); // Оставляем только цифры

if($kId) {
    $kUrl = "https://rating.kinopoisk.ru/".$kId.".xml";
    $xml = simplexml_load_file($kUrl);
    // print_r($xml);

    $data["kp"] = round(floatval($xml->kp_rating[0]), 1);
    $data["imdb"] = round(floatval($xml->imdb_rating[0]), 1);

    $json = json_encode($data);
    if ($json === false) {
        $json = json_encode(array("jsonError", json_last_error_msg()));
        if ($json === false) {
            $json = '{"jsonError": "unknown"}';
        }
        http_response_code(500);
    }
    echo $json;
}
?>
