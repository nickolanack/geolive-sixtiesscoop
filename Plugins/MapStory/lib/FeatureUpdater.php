<?php

namespace MapStory;


class FeatureUpdater{

	protected function getPlugin(){
		return GetPlugin('MapStory');
	}

	public function fromObject($json){


		$feature=$this->getPlugin()->getUsersStoryMarker($json->id);

		if($feature->getId()<=0&&empty($json->location)){
			throw new \Exception('Requires location for new items: '.$feature->getId());
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

		return $feature;

	}

}