





$feature['info']=array(
    'icon'=>$feature['icon']
);
$feature['icon']=str_replace('php-core-app/users_files','uploads-sixtiesscoop.geoforms.ca', $feature['icon']);


if( isset($feature['data']['storyAttributes']['isBirthStory'])&&
    isset($feature['data']['storyAttributes']['hasStoryVideos'])){
        
    $birthStory=$feature['data']['storyAttributes']['isBirthStory'];
    $hasStoryVideos=$feature['data']['storyAttributes']['hasStoryVideos'];
    
    if(($birthStory==="true"||$birthStory===true)
        &&($hasStoryVideos==="true"||$hasStoryVideos===true)){
         $feature['icon']="https://nickolanackbucket.s3.us-west-2.amazonaws.com/sixtiesscoop.geoforms.ca/1/Uploads/0Zu_%5BImAgE%5D_MgG_%5BG%5D_1LQ.png";
         error_log(print_r($feature,true));
        
    }
        
   
}

return $feature;