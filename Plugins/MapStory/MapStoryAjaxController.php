<?php

class MapStoryAjaxController extends core\AjaxController implements core\PluginMember {
	use core\PluginMemberTrait;

	protected function saveStoryItem($json){


		if(!Auth('write', $json->id, $json->type)){
			return $this->setError('No access');
		}

		

		$feature=(new \MapStory\FeatureUpdater())->fromObject($json);

		
		return array('item'=>$this->getPlugin()->formatFeatureMetadata($feature->getMetadata()), 'story'=>$this->getPlugin()->getUsersStoryMetadata());

	}	

	protected function deleteStoryItem($json){

		if(!Auth('write', $json->id, $json->type)){
			return $this->setError('No access');
		}

		GetPlugin('Maps');
		return !!(new \spatial\FeatureLoader())->delete((new \spatial\FeatureLoader())->fromId($json->id));
		

	}

	protected function getStoryWithItem($json){

		$list=$this->getPlugin()->getFeaturesMetadata($json->item);
		$user=$list[0]['uid'];

		//features is for debug
		return  array('features'=>$list, 'story'=>$this->getPlugin()->getUsersStoryMetadata($user), 'user'=>$this->getPlugin()->getUsersMetadata($user));


	}


	

	protected function getStoryWithUser($json){


		return  array('story'=>$this->getPlugin()->getUsersStoryMetadata($json->user), 'user'=>$this->getPlugin()->getUsersMetadata($json->user));


	}

	protected function getStory(){

		return  array('story'=>$this->getPlugin()->getUsersStoryMetadata(), 'user'=>$this->getPlugin()->getUsersMetadata());


	}


	protected function search($json){

		return  array('results'=>$this->getPlugin()->searchStories($json->search));


	}

	protected function getFeatureList($json){

		$list=$this->getPlugin()->getFeatureListMetadata($json->items);
		return  array('results'=>$list);


	}


}