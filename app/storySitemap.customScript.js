<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	
	<?php 

	 foreach(GetPlugin('Maps')->listStories() as $story){
	     
	     
	     echo json_ecode($story, JSON_PRETTY_PRINT)."\n\n";
	 }


	?>

</urlset>