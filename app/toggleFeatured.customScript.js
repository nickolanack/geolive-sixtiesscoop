
$featured=GetConfig('featuredStoriesItems')->getConfigurationValue('featured');



$plugin=GetPlugin('MapStory');
$list=$plugin->getFeaturesMetadata($json->item);
		$user=$list[0]['uid'];

		if(!is_numeric($user)){

		}

		//features is for debug
		$story=  array(
		    'features'=>$list, 
		    'story'=>$plugin->getUsersStoryMetadata($user), 
		    'user'=>(is_numeric($user)?$plugin->getUsersMetadata($user):null)
		    );
		    
$shouldRemove=false;	    
$featured=array_filter($f, function()use($story, &$shouldRemove){
    
    if($story['features'][0]['id']===$f['id']){
        $remove=true;
        return false;
    }
    
});

return array_values($featured);


return true;