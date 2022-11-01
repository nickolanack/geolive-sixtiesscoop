var links= [
    new MockDataTypeItem({name:"Share", "className":"share" click:function(){
        
    }}), 
    new MockDataTypeItem({name:"Contact", "className":"contact", click:function(){
        
    }}), 
   
];


if(AppClient.getUserType()!=="guest"){
        

 
 if(AppClient.getUserType()=="admin"){
    links.push(new MockDataTypeItem({name:"Edit story", "className":"edit", click:function(){
       
    }}));
 }
 
 
    
}


return links;