const FOAF = $rdf.Namespace('http://xmlns.com/foaf/0.1/');
const EXMP = $rdf.Namespace('https://example.org/fragments/');

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

async function loadShark(name) {
  $("#shark").show();
  if (sharks.includes(name)) {
    $("#error").hide();
    $("#name").show();
    $("#viewer").show();
    $("#name").text(name);
    const sparqlQuery = 'SELECT ?uri WHERE { ?uri ?p "' + name + '" .}';
    const query = $rdf.SPARQLToQuery(sparqlQuery, true, store);
    store.query(query, function(result) {
      var uri = (result['?uri']).value;
      $('#wiki').text(uri);
      $('#wiki').attr('href', uri);
      const shark = $rdf.sym(uri + '');
      var gender = store.any(shark, FOAF('gender'));
      $('#gender').text(gender.value);
      var country = store.any(shark, EXMP('country'));
      $('#country').text(country.value);
    });
  } else {
    $("#error").show();
    $("#name").hide();
    $("#viewer").hide();
  }
}
