<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://example.com/sample1.html</loc>
    <image:image>
      <image:loc>https://example.com/image.jpg</image:loc>
    </image:image>
    <image:image>
      <image:loc>https://example.com/photo.jpg</image:loc>
    </image:image>
  </url>
  <url>
    <loc>https://example.com/sample2.html</loc>
    <image:image>
      <image:loc>https://example.com/picture.jpg</image:loc>
    </image:image>
  </url>


   <?php 
	
	$root=HtmlDocument()->website();

	 foreach(GetPlugin('MapStory')->listStories() as $story){
	    
	        if($story['id']!==327){
	            continue;
	        }
	    
	        $path=$root.'/story/'.$story['id'];
	        
	 
	     ?>
	        
	        <url>
				<loc><?php echo $path?></loc>
				<image:image>
                    <image:loc>https://example.com/picture.jpg</image:loc>
                </image:image>
				<lastmod><?php echo $date;?></lastmod>
			</url>
	     <?php
	     
	     
	     
	     echo json_encode($story, JSON_PRETTY_PRINT)."\n\n";
	     break;
	 }


	?>
  
  
</urlset>