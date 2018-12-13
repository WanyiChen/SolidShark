const FOAF = $rdf.Namespace('http://xmlns.com/foaf/0.1/');
const EXMP = $rdf.Namespace('https://example.org/fragments/');
const SCMA = $rdf.Namespace('http://schema.org/');

var store = $rdf.graph();
var fetcher = new $rdf.Fetcher(store);
var url = 'https://wanyi.solid.community/public/shark.ttl';
var sharks = ["Barbara Corcoran", "Daymond John", "Kevin O'Leary", "Lori Greiner", "Mark Cuban", "Robert Herjavec"];

//Autocompletion in search bar. Right now it only supports searching deal sharks by name.
$('#profile').autocomplete({
  source: sharks
});

//load rdf data into local store
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

$('#deal').on('click', '#epi', (e) => {
  let target = $(e.target);
  loadEpisode(target.attr("uri"), target.text());
});

$('#episode').on('click', 'li', (e) => {
  let target = $(e.target);
  loadDeal(target.attr("id"), target.text());
});

//Load a deal shark's profile
async function loadShark(name) {
  $("#shark").show();
  $("#deal").hide();
  $("#episode").hide();
  if (sharks.includes(name)) {
    $("#error").hide();
    $("#name").show();
    $("#viewer").show();
    $("#name").text(name);
    $('#deals').empty();
    //query the data store and retrieve the URI, gender and country for the deal shark
    const sharkQuery = 'SELECT ?uri WHERE { ?uri ?p "' + name + '" .}';
    const query = $rdf.SPARQLToQuery(sharkQuery, true, store);
    store.query(query, function(result) {
      var uri = (result['?uri']).value;
      $('#wiki').text(uri);
      $('#wiki').attr('href', uri);
      const shark = $rdf.sym(uri);
      var gender = store.any(shark, FOAF('gender'));
      $('#gender').text(gender.value);
      var country = store.any(shark, EXMP('country'));
      $('#country').text(country.value);
      //get a list of clickable deals made by that deal shark
      const dealQuery = 'SELECT ?dealName ?deal WHERE { ?deal <https://example.org/fragments/hasDealShark> <' + uri + '> . ?deal <http://schema.org/name> ?dealName.}';
      const query2 = $rdf.SPARQLToQuery(dealQuery, true, store);
      store.query(query2, function(result) {
        $('#deals').append($('<li>').append(result['?dealName'].value).attr('id', result['?deal'].value));
      });
    });
  } else {
    //User tried to search an invalid input. Show error.
    $("#error").show();
    $("#name").hide();
    $("#viewer").hide();
  }
}

//Load a deal's details. URI is the business' URI, and name is business name.
async function loadDeal(uri, name) {
  $("#shark").hide();
  $("#deal").show();
  $("#episode").hide();
  $("#sharks").empty();
  $("#dealName").text(name);
  //query the data store and retrieve the pitch description for the deal
  const deal = $rdf.sym(uri);
  var pitch = store.any(deal, SCMA('description'));
  $('#pitch').text(pitch.value);
  //get a list of clickable deal sharks who made that deal
  const dealQuery = 'SELECT ?sharkName WHERE { <' + uri + '> <https://example.org/fragments/hasDealShark> ?shark . ?shark <http://xmlns.com/foaf/0.1/name> ?sharkName .}';
  const query = $rdf.SPARQLToQuery(dealQuery, true, store);
  store.query(query, function(result) {
    $("#sharks").show();
    $('#noDeal').hide();
    $('#sharks').append($('<li>').append(result['?sharkName'].value));
  });
  //If there were no deal sharks for that business, then show the user that no deal was made.
  if ($('#sharks li').length < 1) {
    $('#sharks').hide();
    $('#noDeal').show();
  }
  //query the data store and retrieve the episode for the deal
  const epiQuery = 'SELECT ?epi ?epiNum WHERE {?epi <https://example.org/fragments/showCases>  <' + uri + '> . ?epi <http://schema.org/episodeNumber> ?epiNum .}';
  const query2 = $rdf.SPARQLToQuery(epiQuery, true, store);
  store.query(query2, function(result) {
    //store the uri so that it's easier to load episodes later
    $('#epi').text(result['?epiNum'].value);
    $('#epi').attr("uri", result['?epi']);
  });
}

//Load an episode's details. URI is the episode' URI, and num is the episode number (a int).
async function loadEpisode(uri, num) {
  $("#shark").hide();
  $("#deal").hide();
  $("#episode").show();
  $("#episodeNum").text("Episode " + num);
  $("#epiDeals").empty();
  //get a list of clickable businesses show cased on the episode
  const epi = $rdf.sym(uri);
  const epiQuery = 'SELECT ?busi ?busiName WHERE {' + uri + ' <https://example.org/fragments/showCases> ?busi . ?busi <http://schema.org/name> ?busiName .}';
  const query = $rdf.SPARQLToQuery(epiQuery, true, store);
  store.query(query, function(result) {
    //store the uri so that it's easier to load deals later
    $('#epiDeals').append($('<li>').append(result['?busiName'].value).attr('id', result['?busi'].value));
  });
}
