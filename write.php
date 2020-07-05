<?php

if($_POST["modules"]) {
    copy("modules.csv","modules_previous.csv");
    // echo "Welcome ". $_POST['modules']. "<br />";  
    $myfile = fopen("modules.csv", "w") or die("Unable to open file!");
    $headers = array('id','Name','Hours','StartDate','EndDate','Notes','CurrentlyStudying','Finished','HoursPerWeek');
    $headersstr = join(",",$headers) . "\n";
    fwrite($myfile, $headersstr);
    fwrite($myfile, $_POST["modules"]);
    fclose($myfile);
    exit();
}

?>