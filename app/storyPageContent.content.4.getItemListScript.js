var links= [
    new MockDataTypeItem({name:"Share", click:function(){
        
    }}), 
    new MockDataTypeItem({name:"Contact", click:function(){
        
    }}), 
   
];


if(AppClient.getUserType()!=="guest"){
        

 
 if(AppClient.getUserType()=="admin"){
    links.push(new MockDataTypeItem({name:"Edit story", click:function(){
       
    }}));
 }
 
 
    
}


return links;