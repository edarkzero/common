<?php
class FileHandler
{
    public function upload()
    {
        if (\Input::hasFile('file')) {
            $type = isset($_POST['image-type']) ? $_POST['image-type'] : "";

            //upload an image to the /img/tmp directory and return the filepath.
            $file = \Input::file('file');
            $tmpFilePath = '/img/tmp/';
            $tmpFileName = time() . '-' . $file->getClientOriginalName();
            $file = $file->move(public_path() . $tmpFilePath, $tmpFileName);
            $path = $tmpFilePath . $tmpFileName;
            return response()->json(array('path' => url('/').$path,'name' => $tmpFileName,'type' => $type), 200);
        } else {
            return response()->json(false, 200);
        }
    }
}