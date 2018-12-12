const FOAF = $rdf.Namespace('http://xmlns.com/foaf/0.1/');
const EXMP = $rdf.Namespace('https://example.org/fragments/');
const SCMA = $rdf.Namespace('http://schema.org/');

var store = $rdf.graph();
var fetcher = new $rdf.Fetcher(store);
var url = 'https://wanyi.solid.community/public/shark.ttl';
var sharks = ["Barbara Corcoran", "Daymond John", "Kevin O'Leary", "Lori Greiner", "Mark Cuban", "Robert Herjavec"];

$('#profile').autocomplete({
  source: sharks
});

fetcher.nowOrWhenFetched(url, function(ok, body, xhr) {
  if (!ok) {
    console.log("Oops, something happened and couldn't fetch data");
  }
});

$('#view').on("click", () => {
  loadShark($('#profile').val());
});

$('#shark').on('click', 'li', (e) => {
  let target = $(e.target);
  loadDeal(target.attr("id"), target.text());
});

$('#deal').on('click', 'li', (e) => {
  let target = $(e.target);
  loadShark(target.text());
});

async function loadShark(name) {
  $("#shark").show();
  $("#deal").hide();
  if (sharks.includes(name)) {
    $("#error").hide();
    $("#name").show();
    $("#viewer").show();
    $("#name").text(name);
    $('#deals').empty();
    const sharkQuery = 'SELECT ?uri WHERE { ?uri ?p "' + name + '" .}';
    const query = $rdf.SPARQLToQuery(sharkQuery, true, store);
    store.query(query, function(result) {
      var uri = (result['?uri']).value;
      $('#wiki').text(uri);
      $('#wiki').attr('href', uri);
      const shark = $rdf.sym(uri + '');
      var gender = store.any(shark, FOAF('gender'));
      $('#gender').text(gender.value);
      var country = store.any(shark, EXMP('country'));
      $('#country').text(country.value);
      const dealQuery = 'SELECT ?dealName ?deal WHERE { ?deal <https://example.org/fragments/hasDealShark> <' + uri + '> . ?deal <http://schema.org/name> ?dealName.}';
      const query2 = $rdf.SPARQLToQuery(dealQuery, true, store);
      store.query(query2, function(result) {
        $('#deals').append($('<li>').append(result['?dealName'].value).attr('id', result['?deal'].value));
      });
    });
  } else {
    $("#error").show();
    $("#name").hide();
    $("#viewer").hide();
  }
}

async function loadDeal(uri, name) {
  $("#shark").hide();
  $("#deal").show();
  $("#sharks").empty();
  $("#dealName").text(name);
  const deal = $rdf.sym(uri + '');
  var pitch = store.any(deal, SCMA('description'));
  $('#pitch').text(pitch.value);
  const dealQuery = 'SELECT ?sharkName WHERE { <' + uri + '> <https://example.org/fragments/hasDealShark> ?shark . ?shark <http://xmlns.com/foaf/0.1/name> ?sharkName .}';
  const query = $rdf.SPARQLToQuery(dealQuery, true, store);
  store.query(query, function(result) {
    $('#sharks').append($('<li>').append(result['?sharkName'].value));
  });
}
