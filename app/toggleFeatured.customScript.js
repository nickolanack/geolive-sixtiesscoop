
//return GetConfig('featuredStoriesItems')->getConfigurationValue('featured');


$list=$this->getPlugin()->getFeaturesMetadata($json->item);
		$user=$list[0]['uid'];

		if(!is_numeric($user)){

		}

		//features is for debug
		return  array('features'=>$list, 'story'=>$this->getPlugin()->getUsersStoryMetadata($user), 'user'=>(is_numeric($user)?$this->getPlugin()->getUsersMetadata($user):null));



return true;