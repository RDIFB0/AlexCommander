<?php

class FM
{

    public function exec($action, array $params)
    {
        $method_name = '_'.$action;

        if (method_exists($this, $method_name))
        {
            return call_user_func_array(array($this, $method_name), $params);
        }

        throw new Exception('Action not found');
    }

    protected function _fileList($dir, $limit = null, $offset = null)
    {
        $di = new DirectoryIterator($dir);

        // return iterator_to_array($di);
        $result = array();

        foreach ($di as $fileInfo)
        {
            $perms = $fileInfo->getPerms();

            if (($perms & 0xC000) == 0xC000) {
                // Сокет
                $info = 's';
            } elseif (($perms & 0xA000) == 0xA000) {
                // Символическая ссылка
                $info = 'l';
            } elseif (($perms & 0x8000) == 0x8000) {
                // Обычный
                $info = '-';
            } elseif (($perms & 0x6000) == 0x6000) {
                // Специальный блок
                $info = 'b';
            } elseif (($perms & 0x4000) == 0x4000) {
                // Директория
                $info = 'd';
            } elseif (($perms & 0x2000) == 0x2000) {
                // Специальный символ
                $info = 'c';
            } elseif (($perms & 0x1000) == 0x1000) {
                // Поток FIFO
                $info = 'p';
            } else {
                // Неизвестный
                $info = 'u';
            }

            // Владелец
            $info .= (($perms & 0x0100) ? 'r' : '-');
            $info .= (($perms & 0x0080) ? 'w' : '-');
            $info .= (($perms & 0x0040) ? (($perms & 0x0800) ? 's' : 'x' ) : (($perms & 0x0800) ? 'S' : '-'));

            // Группа
            $info .= (($perms & 0x0020) ? 'r' : '-');
            $info .= (($perms & 0x0010) ? 'w' : '-');
            $info .= (($perms & 0x0008) ? (($perms & 0x0400) ? 's' : 'x' ) : (($perms & 0x0400) ? 'S' : '-'));

            // Мир
            $info .= (($perms & 0x0004) ? 'r' : '-');
            $info .= (($perms & 0x0002) ? 'w' : '-');
            $info .= (($perms & 0x0001) ? (($perms & 0x0200) ? 't' : 'x' ) : (($perms & 0x0200) ? 'T' : '-'));

            // dvd($fileInfo);
            $result['files'][] = array(
                'name' => $fileInfo->getFilename(),
                'perm' => $info,
            );
        }

        return $result;

        /*
        foreach ( as $fileInfo) {
            if($fileInfo->isDot()) continue;
            echo $fileInfo->getFilename() . "<br>\n";
            getPathname
        }
        */
    }
}


$action = filter_input(INPUT_POST, 'method');
$params = filter_input(INPUT_POST, 'params', FILTER_DEFAULT, FILTER_FORCE_ARRAY);

// die(var_dump(   $_POST, $params     ));

$fm = new FM();
$response = $fm->exec($action, $params);

header('Content-Type: application/json');

echo json_encode($response);
