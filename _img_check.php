<?php
$info = getimagesize('resources/css/shopp.png');
echo 'Width: ' . $info[0] . PHP_EOL;
echo 'Height: ' . $info[1] . PHP_EOL;
echo 'Mime: ' . $info['mime'] . PHP_EOL;
echo 'Bits: ' . $info['bits'] . PHP_EOL;
print_r($info);
