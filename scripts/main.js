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

$('#deal').on('click', '#epi', (e) => {
  let target = $(e.target);
  loadEpisode(target.attr("uri"), target.text());
});

$('#episode').on('click', 'li', (e) => {
  let target = $(e.target);
  loadDeal(target.attr("id"), target.text());
});

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
  $("#episode").hide();
  $("#sharks").empty();
  $("#dealName").text(name);
  const deal = $rdf.sym(uri);
  var pitch = store.any(deal, SCMA('description'));
  $('#pitch').text(pitch.value);
  const dealQuery = 'SELECT ?sharkName WHERE { <' + uri + '> <https://example.org/fragments/hasDealShark> ?shark . ?shark <http://xmlns.com/foaf/0.1/name> ?sharkName .}';
  const query = $rdf.SPARQLToQuery(dealQuery, true, store);
  store.query(query, function(result) {
    $("#sharks").show();
    $('#noDeal').hide();
    $('#sharks').append($('<li>').append(result['?sharkName'].value));
  });
  if ($('#sharks li').length < 1) {
    $('#sharks').hide();
    $('#noDeal').show();
  }
  const epiQuery = 'SELECT ?epi ?epiNum WHERE {?epi <https://example.org/fragments/showCases>  <' + uri + '> . ?epi <http://schema.org/episodeNumber> ?epiNum .}';
  const query2 = $rdf.SPARQLToQuery(epiQuery, true, store);
  store.query(query2, function(result) {
    $('#epi').text(result['?epiNum'].value);
    $('#epi').attr("uri", result['?epi']);
  });
}

async function loadEpisode(uri, num) {
  $("#shark").hide();
  $("#deal").hide();
  $("#episode").show();
  $("#episodeNum").text("Episode " + num);
  $("#epiDeals").empty();
  const epi = $rdf.sym(uri);
  const epiQuery = 'SELECT ?busi ?busiName WHERE {' + uri + ' <https://example.org/fragments/showCases> ?busi . ?busi <http://schema.org/name> ?busiName .}';
  console.log(epiQuery);
  const query = $rdf.SPARQLToQuery(epiQuery, true, store);
  store.query(query, function(result) {
    console.log(result['?busiName'].value);
    $('#epiDeals').append($('<li>').append(result['?busiName'].value).attr('id', result['?busi'].value));
  });
}
