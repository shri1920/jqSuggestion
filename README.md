# jqSuggestion

jqSuggestion is a simple jQuery auto suggestion plugin.

## Usage

```html
  <div>
    <input type="text" name="text" id='sample-1' />
    <br /><br />
    <input type="text" name="text" id='sample-2' />
  </div>
```
```javascript
  $("#sample-1").jqSuggestion({
      "duplicate"   : false,
      "limit"       : 4,
      "preSelected" : ["Blackberry", "Samsung"] || [],
      "suggestions" : ["Alcatel", "Apple", "Asus", "Blackberry", "Celkon", "Lg", "Micromax", "Samsung", "Sony"],
      "update"      : function () {
      }
  });
  
  $("#sample-2").jqSuggestion({
      "duplicate"   : true,
      "preSelected" : ["Blackberry", "Samsung"] || [],
      "suggestions" : ["Alcatel", "Apple", "Asus", "Blackberry", "Celkon", "Lg", "Micromax", "Samsung", "Sony", "Xiomi"],
      "update"      : function () {                
      }
  });
```