<?php

class MapStoryAjaxController extends core\AjaxController implements core\PluginMember {
	use core\PluginMemberTrait;

	protected function saveStoryItem($json){


		if(!Auth('write', $json->id, $json->type)){
			return $this->setError('No access');
		}

		$feature=$this->getPlugin()->getUsersStoryMarker($json->id);

		if($feature->getId()<=0&&empty($json->location)){
			return $this->setError('Requires location');
		}

		$feature->setName("some name");
		$feature->setDescription($json->description);



		if(!empty($json->location)){
			$feature->setCoordinates($json->location->lat,$json->location->lng);
		}


		$feature->setLayerId($this->getPlugin()->getStoryLayerId());


		$defaultIcon=UrlFrom(GetWidget('siteConfig')->getParameter('storyIcon')[0] . '?thumb=>48>48');
		$feature->setIcon($defaultIcon);

		if (key_exists('attributes', $json)){
			if(key_exists('storyAttributes', $json->attributes)){
				$attrs=$json->attributes->storyAttributes;
				if(key_exists('isBirthStory', $attrs)&&$attrs->isBirthStory){
					$defaultIcon=UrlFrom(GetWidget('siteConfig')->getParameter('birthIcon')[0] . '?thumb=>48>48');
					$feature->setIcon($defaultIcon);
				}

				if(key_exists('isRepatriationStory', $attrs)&&$attrs->isRepatriationStory){
					$defaultIcon=UrlFrom(GetWidget('siteConfig')->getParameter('repatriationIcon')[0] . '?thumb=>48>48');
					$feature->setIcon($defaultIcon);
				}
			}
		}

		(new \spatial\FeatureLoader())->save($feature);
		

		GetPlugin('Attributes');
		if (key_exists('attributes', $json)) {
			foreach ($json->attributes as $table => $fields) {
				(new \attributes\Record($table))->setValues($feature->getId(), "MapStory.card", $fields);
			}
		}

		(new \attributes\Record($table))->setValues($feature->getId(), "MapStory.card", array(
			"locationName"=>$json->address
		));




		
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

	protected function getStory($json){

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