const cheerio = require('cheerio');

module.exports = {
  parse_item: function (item_node) {
    var item = {
      name: "",
      description: "",
      categories: [],
      actions: []
    };
    const nameNode = item_node.find('p');
    const descriptionNode = item_node.find('span');
    item.name = nameNode;
    item.description = descriptionNode;
    item_node.find('ul').children().each(function (i, el){
      if (el.type === "tag") {
        if (el.attribs.class === 'violet') {
          item.categories.push(cheerio.load(el));
        }
        if (el.attribs.class === 'marron') {
          item.actions.push(el);
        }
      }
    })
    return item
  },
  render_item: function(item) {
    var output = "";
    // name
    output += "**" + item.name.text().trim() + "**" + "\n";
    //description
    output += item.description.text().trim() + "\n";
    //categories
    for(var i = 0; i < item.categories.length;i++){
      output += ":small_orange_diamond:" + item.categories[i].text() + "\n";
    }
    //actions
    item.actions.forEach(function(act){
      output += ":small_blue_diamond:";
      act.children.forEach(function(node){
        if (node.type === "tag") {
          if (node.name === "a") {
            output += node.children[0].attribs.title;
          }
          if (node.name === "img") {
            if (node.attribs.title !== undefined) {
              output += node.attribs.title;
            }
          }
        }
        if (node.type === "text") {
          output += node.data;
        }
      })
      output += "\n";
    });
    output += "\n\n";
    return output
  },
  get_item_name : function(item) {
    //return item.name.contents()['1'].data.trim();
    return item.name.text().trim();
  }
};
