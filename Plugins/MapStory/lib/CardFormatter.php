<?php

namespace MapStory;

class CardFormatter {


	protected function extractAttributes($feature, $prefix){
		$attributes=array();
		foreach(array_keys($feature) as $key){
			if(strpos($key, $prefix)===0){
				$attributes[substr($key, strlen($prefix))]=$feature[$key];
			}
		}

		return $attributes;

	}

	protected function removeAttributes($feature, $prefix){

		foreach(array_keys($feature) as $key){
			if(strpos($key, $prefix)===0){
				unset($feature[$key]);
			}
		}
		return $feature;
	}

	

	public function format($feature, $attributes = null) {

		if(is_object($feature)){
			$feature=get_object_vars($feature);
		}
		

		if(gettype($attributes)=='string'){
			$prefix=$attributes;
			$attributes=$this->extractAttributes($feature, $prefix);
			$feature=$this->removeAttributes($feature, $prefix);
		}





		if (!$attributes) {
			GetPlugin('Attributes');
			$attr = (new \attributes\Record('storyAttributes'));
			$attributes = $attr->getValues($feature['id'], "MapStory.card");
		}


		if(gettype($featureMeta['coordinates'])=='string'){
			$featureMeta['coordinates']=json_decode($featureMeta['coordinates']);
			if(isset($featureMeta['coordinates']->coordinates)){
				$featureMeta['coordinates']=$featureMeta['coordinates']->coordinates;
			}
		}


		if(!empty($attributes['locationData'])){

			$location=json_decode($attributes['locationData']);
			if(json_encode($location->coordinates)!==json_encode($feature['coordinates'])){

				error_log('clear location data');

				$attributes['locationData']=null;
			}

		}

		if (empty($attributes['locationData'])) {

			$jsonLocationData = $this->parseLocationData($feature);
			if (!empty($jsonLocationData)) {
				$attributes['locationData'] = $jsonLocationData;
			}
		}

		$attributes['locationData'] = json_decode($attributes['locationData']);

		if (empty($attributes['locationName']) || $attributes['locationName'] === "false") {

			$attributes['locationName'] = $this->parseLocationName($feature['id'], $attributes);

		}

		$feature['attributes'] = $attributes;

		return $feature;
	}

	protected function parseLocationName($itemId, $attributes) {

		$locationName = false;
		foreach ($attributes['locationData']->geocode->address_components as $addressResult) {
			if (in_array('locality', $addressResult->types)) {
				$locationName = $addressResult->long_name;
				break;
			}
		}


		if ($locationName && $locationName != "false") {

			\core\DataStorage::LogQuery("Update Location Name");

			(new \attributes\Record('storyAttributes'))->setValues($itemId, "MapStory.card", array(
				"locationName" => $locationName,
			));
		}

		return $locationName;
	}

	protected function parseLocationData($featureMeta) {
		GetPlugin('GoogleMaps');
		\core\DataStorage::LogQuery("Query Location Data: ".$featureMeta['id']);

		

		$lat=$featureMeta['coordinates'][0];
		$lng=$featureMeta['coordinates'][1];

		$geocode = (new \GoogleMaps\Geocoder())->fromCoordinates(
			$lat, $lng,
			GetPlugin('Maps')->getParameter('googleMapsServerApiKey', false)
		);
		error_log(json_encode(array($geocode, $lat, $lng, $featureMeta['coordinates'])));
		if (key_exists('results', $geocode) && count($geocode->results)) {

			$locationData = array(
				"coordinates" => $featureMeta['coordinates'],
				"geocode" => $geocode->results[0],
			);

			$jsonLocationData = json_encode($locationData);

			\core\DataStorage::LogQuery("Update Location Geocode Data");

			(new \attributes\Record('storyAttributes'))->setValues($featureMeta['id'], "MapStory.card", array(
				"locationData" => $jsonLocationData,
			));

			return $jsonLocationData;

		}else{

		}

		return null;

	}

}