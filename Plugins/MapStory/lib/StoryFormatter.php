<?php

namespace MapStory;

class StoryFormatter {

	protected $makeChanges = false;

	protected $hasBirthStory = false;
	protected $indexOfBirthStory = -1;

	protected $hasAdoptionStory = false;
	protected $userId=-1;

	public function setCommitChanges($bool) {
		$this->makeChanges = true;
		return $this;
	}
	public function forUser($id) {
		$this->userId = $id;
		return $this;
	}
	public function format($list) {

		$hasRepatriationStory = false;

		$indexOfBirth = -1;

		$list = $this->sort($list);

		foreach ($list as $index => &$feature) {

			$attributes = $feature['attributes'];
			$attributesOriginal=$attributes;

			if ($this->shouldBeBirthStory($attributes, $index)) {
				$attributes = $this->setAsBirthStory($attributes, $index);
			}else{
				$attributes = $this->clearBirthStory($attributes);
			}

			if ($this->shouldBeAdoptionStory($attributes, $index)) {
				$attributes = $this->setAsAdoptionStory($attributes, $index);			
			}else{
				$attributes = $this->clearAdoptionStory($attributes);
			}


			if ($this->isRepatriationStory($attributes)) {

				if (!$hasRepatriationStory) {
					$hasRepatriationStory = true;
					continue;

				}
				$attributes['isRepatriationStory'] = false;

			}

			if($this->userId>0){
				if(intval($attributes['storyUser'])!=$this->userId){
					
					$attributes['storyUser']=$this->userId;

					
				}
				
			}
			
			if($this->makeChanges){
				$updates=array();
				foreach($attributes as $key=>$value){
					if((!is_bool($value))&&$value!==$attributesOriginal[$key]){
						$updates[$key]=$value;
					}

					if(is_bool($value)&&($value?"true":"false")!==$attributesOriginal[$key]){
						$updates[$key]=$value;
					}
				}
				if(!empty($updates)){
					//error_log(json_encode($updates));
					//error_log(json_encode($attributesOriginal));
					(new \attributes\Record('storyAttributes'))->setValues($feature['id'], "MapStory.card", $updates);
				}
			}


			$feature['attributes'] = $attributes;
		}

		for ($i = 0; $i < count($list) - 1; $i++) {

			if (json_encode($list[$i]['attributes']['nextLocationData']) !== json_encode($list[$i + 1]['attributes']['locationData'])) {

				$list[$i]['attributes']['nextLocationData'] = $list[$i]['attributes']['locationData'];


				(new \attributes\Record('storyAttributes'))->setValues($list[$i]['id'], "MapStory.card", array(
					"nextLocationData" => json_encode($list[$i + 1]['attributes']['locationData']),
				));

			}

		}






		return $list;

	}

	protected function clearBirthStory($attributes) {
		$attributes['isBirthStory'] = false;
		return $attributes;
	}
	protected function setAsBirthStory($attributes, $index) {

		if ($this->hasBirthStory) {
			throw new \Exception('Already has birth story');
		}

		$this->hasBirthStory = true;
		$this->indexOfBirth = $index;





		$attributes['isRepatriationStory'] = false;
		$attributes['isAdoptionStory'] = false;
		$attributes['isBirthStory'] = true;


	

		return $attributes;

	}

	protected function isRepatriationStory($attributes) {
		return $attributes['isRepatriationStory'] === "true" || $attributes['isRepatriationStory'] === true;
	}

	protected function shouldBeBirthStory($attributes, $index) {
		if($this->hasBirthStory){
			return false;
		}
		return $this->isBirthStory($attributes, $index);
	}
	protected function isBirthStory($attributes, $index) {
		return $attributes['isBirthStory'] === "true" || $attributes['isBirthStory'] === true;
	}

	protected function shouldBeAdoptionStory($attributes, $index) {

		if($this->hasAdoptionStory){
			return false;
		}
		if ($this->hasBirthStory && $this->indexOfBirth < $index&&(!$this->isRepatriationStory($attributes))) {
			return true;
		}
		return false;

		
	}

	protected function clearAdoptionStory($attributes) {
		$attributes['isAdoptionStory'] = false;
		return $attributes;

	}
	protected function setAsAdoptionStory($attributes, $index) {

		if($this->hasAdoptionStory){
			throw new \Exception('Already has adoption story');
		}
		
		$this->hasAdoptionStory = true;
		
		$attributes['isRepatriationStory'] = false;
		$attributes['isBirthStory'] = false;
		$attributes['isAdoptionStory'] = true;
		return $attributes;
		
	}

	protected function isAdoptionStory($attributes) {
		return $attributes['isAdoptionStory'] === "true" || $attributes['isAdoptionStory'] === true;
	}

	protected function sort($list) {

		usort($list, function ($a, $b) {

			return strtotime($a['attributes']['locationDate']) - strtotime($b['attributes']['locationDate']);
		});

		return $list;
	}
}