<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	
	<?php 
	
	$root=HtmlDocument()->website().'/story/';

	 foreach(GetPlugin('MapStory')->listStories() as $story){
	    
	        $path=$root.$story['id'];
	        $date=explode(' ',$story['features'][0][modificationDate])[0];
	 
	     ?>
	        <url>
				<loc><?php echo $path?></loc>
				<lastmod><?php echo $date;?></lastmod>
			</url>
	     <?php
	     
	     //echo json_encode($story, JSON_PRETTY_PRINT)."\n\n";
	 }


	?>

</urlset>