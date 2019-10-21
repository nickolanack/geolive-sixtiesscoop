<?php 

namespace MapStory;

class CardSearch{
	

	protected function formatFeatureMetadata($feature, $attributes = null) {
		return (new \MapStory\CardFormatter())->format($feature, $attributes);
	}

	protected function getUsersMetadata($userId = -1) {

		if ($userId == -1) {
			$userId = GetClient()->getUserId();
		}

		return (new \attributes\Record('profileAttributes'))->getValues($userId, "user");

	}

	public function searchStories($keyword) {

		GetPlugin('Maps');
		GetPlugin('Attributes');
		$attr = (new \attributes\Record('storyAttributes'));
		$list = array();

		$users = array();

		(new \spatial\Features())
			->withFilter(array(array(
				"join" => 'OR',
				array(
					'field' => 'name',
					'comparator' => ' LIKE ',
					'value' => '%' . $keyword . '%',
				),
				array(
					'field' => 'description',
					'comparator' => ' LIKE ',
					'value' => '%' . $keyword . '%',
				),

			)))
			->iterate(function ($feature) use (&$list, &$attr, &$users) {

				$attributes = $attr->getValues($feature['id'], "MapStory.card");

				$result = $this->formatFeatureMetadata($feature, $attributes);

				if (!key_exists($result['uid'], $users)) {
					$users[$result['uid']] = $this->getUsersMetadata($result['uid']);
				}

				$result['userData'] = $users[$result['uid']];

				$list[] = $result;

			});

		return $list;

	}

	/**
	 * "search":{"name":false,"dob":false,"mob":false,"yob":false,"lob":false,"nob":false,"ya":false,"location":false}}
	 * @param  [type] $fields [description]
	 * @return [type]         [description]
	 */
	public function searchStoriesAdvanced($fields) {


		

		GetPlugin('Maps');
		GetPlugin('Attributes');
		$attr = (new \attributes\Record('storyAttributes'));
		$list = array();

		$users = array();

		$filter = array();

		if (key_exists('name', $fields)&&(!empty($fields->name))) {
			$filter[] = array(
				'field' => 'name',
				'comparator' => ' LIKE ',
				'value' => '%' . $fields->name . '%',
			);
		}


		if (key_exists('nob', $fields)&&(!empty($fields->nob))) {


			/**
			 * Name of birth (Name at birth) is specific profile but is embedded in the marker name for each story location
			 */

			$filter[] = array(
				'field' => 'name',
				'comparator' => ' LIKE ',
				'value' => '%(%' . $fields->nob . '%)%',
			);

		}


		if (!empty($filter)) {

			$filter["join"] = "OR";

			(new \spatial\Features())
				->withFilter(array($filter))
				->iterate(function ($feature) use (&$list, &$attr, &$users) {

					$attributes = $attr->getValues($feature['id'], "MapStory.card");

					$result = $this->formatFeatureMetadata($feature, $attributes);

					if (!key_exists($result['uid'], $users)) {
						$users[$result['uid']] = $this->getUsersMetadata($result['uid']);
					}

					$result['userData'] = $users[$result['uid']];

					$list[] = $result;

				});

		}

		$attributeFilters = array();
		if (key_exists('location', $fields)&&(!empty($fields->location))) {
			$attributeFilters[] = array(
				'field' => 'locationName',
				'comparator' => 'contains',
				'value' => $fields->location
			);

		}


		$isBirthStory=array(
			"field"=>"isBirthStory",
			"value"=>true
		);

		if (key_exists('lob', $fields)&&(!empty($fields->lob))) {
			$attributeFilters[] = array("filters"=>array(array(
				'field' => 'locationName',
				'comparator' => 'contains',
				'value' => $fields->lob
			), $isBirthStory));

		}


		if (key_exists('ya', $fields)&&(!empty($fields->ya))) {


			/**
			 * Year adopted is specific to isAdoption story card only
			 */



		}


		


		$dateOfBirthFilter=array();
		

		if (key_exists('dob', $fields)&&(!empty($fields->dob))) {
			$dateOfBirthFilter[]=array(
				'field' => 'locationDate',
				'comparator' => 'contains',
				'value' => '%-'.$fields->dob
			);
		}

		if (key_exists('mob', $fields)&&(!empty($fields->mob))) {
			$dateOfBirthFilter[]=array(
				'field' => 'locationDate',
				'comparator' => 'contains',
				'value' => '%-'.$fields->mob.'-%'
			);
		}

		if (key_exists('yob', $fields)&&(!empty($fields->yob))) {
			$dateOfBirthFilter[]=array(
				'field' => 'locationDate',
				'comparator' => 'contains',
				'value' => $fields->yob.'-%'
			);
		}

		if(!empty($dateOfBirthFilter)){
			$dateOfBirthFilter[]=$isBirthStory;
			$attributeFilters[] = array("filters"=>$dateOfBirthFilter);
			
		}


		if (!empty($attributeFilters)) {

			$prefix = 'attribute_';

			
		

			(new \spatial\AttributeFeatures('storyAttributes'))
				->withType('MapStory.card') //becuase attribute type is overriden
				->withAllAttributes($prefix)
				->withFilter('{
					"join":"join",
					"filters":' . json_encode($attributeFilters) . '
				}')->iterate(function ($record) use (&$list, $prefix, &$users) {

				$feature = (new \spatial\FeatureLoader())->fromRecord($record)->getMetadata();
				$attributes=array();
				foreach(array_keys(get_object_vars($record)) as $key){
					if(strpos($key, 'attribute_')===0){
						$attributes[str_replace('attribute_', '', $key)]=$record->$key;
					}
				}

				$result = $this->formatFeatureMetadata($feature, $attributes);
				if (!key_exists($result['uid'], $users)) {
					$users[$result['uid']] = $this->getUsersMetadata($result['uid']);
				}

				$result['userData'] = $users[$result['uid']];
				
				$list[]=$result;

			});

		}

		return $this->formatResults($list);

	}

	protected function formatResults($list){

		$formattedList=array();


		array_walk($list, function($item)use(&$formattedList){

			if(!key_exists($item['uid']+'', $formattedList)){
				$formattedList[$item['uid']+'']=$item;
				return;
			}

			if(!key_exists('additionalResults', $formattedList[$item['uid']+''])){
				$formattedList[$item['uid']+'']['additionalResults']=array();
			}
			$formattedList[$item['uid']+'']['additionalResults'][]=$item;


		});


		return $formattedList;

	}


}