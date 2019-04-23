<?php

namespace MapStory;

class StoryFormatter {


	public function format($list) {


		$hasBirthStory=false;
		$hasRepatriationStory=false;


		$list=$this->sort($list);


		foreach ($list as &$feature) {

			$attributes=$feature['attributes'];

			if($attributes['isBirthStory']==="true"||$attributes['isBirthStory']===true){



			if($hasBirthStory){
					$attributes['isBirthStory']=false;
				}else{
					$hasBirthStory=true;
				}
			}
			if($attributes['isRepatriationStory']==="true"||$attributes['isRepatriationStory']===true){
				if($hasRepatriationStory>){
					$attributes['isRepatriationStory']=false;
				}else{
					$hasRepatriationStory=true;
				}
			}


			$feature['attributes']= $attributes;
		}

		
		return $list;

	}



	protected function sort($list){
		//Todo!
		return $list;
	}
}