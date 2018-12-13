# Shark Tank on Solid
[Demo](https://wanyichen.github.io/SolidShark/)

This project was developed for [UNC's INLS 620](https://aeshin.org/teaching/inls-620/2018/fa/) class and for my own curiosity. The goal is to demonstrate ways to use RDF data and explore what's possible on [Solid](https://solid.inrupt.com/), an ambitious open source project aiming to (re)decentralize the web, led by Tim Berners-Lee and his startup Inrupt. 

The website is about [Shark Tank](https://en.wikipedia.org/wiki/Shark_Tank), a TV show where aspiring entrepreneurs come and pitch their business ideas to judges, known as Deal Sharks. The website lets users explore Shark Tank data. The user will start by typing a deal shark's name into the search bar, which has autocompletion. Then, the website will display the deal shark's profile, including a list of deals made by s/he. Clicking on a deal will show details of the deal, including the episode and a list of deal sharks involved. Clicking on the episode will show details of that episode, including a list of businesses show cased on that episode. In this way, deal sharks, deals, and episodes are all clickable and interconnected to each other.

This website is developed using HTML, CSS, and jQuery. The [RDF dataset](https://wanyi.solid.community/public/shark.ttl) is hosted on my Solid Pod's public folder. This project is first inspired by Solid's [profile viewer tutorial](https://solid.inrupt.com/docs/app-on-your-lunch-break). The data was originally found on [Kaggel](https://www.kaggle.com/neiljs/all-shark-tank-us-pitches-deals/home), in CSV format. During the semester, I transformed the dataset into RDF format, which is heavily used by Solid, and reconciled part of the data against Wikidata for enrichment.

## Development Process
### Get a Solid Pod
Getting a [Solid Pod](https://solid.inrupt.com/get-a-solid-pod) is easy...and free. The idea is that you will store all your data on your Pod, and you'll have complete control over who can read/write your data, instead of handing all your valuable data to the tech giants.
### Host dataset on Solid
Given how Solid focuses on letting users control data, this step was surprisingly hard for me. I initially tried to set up a [Solid server](https://solid.inrupt.com/docs/installing-running-nss), but then realized that I can directly upload my dataset to my Pod through the UI. I definitely think that much can be improved about Solid's UI! But I followed [this instruction](https://github.com/solid/userguide) and it worked. I put the dataset in my public folder so that users don't have to be authenticated to use my website.
### Pull dataset from Solid
Pulling was easy. It's just these lines:
```javascript
var store = $rdf.graph();
var fetcher = new $rdf.Fetcher(store);
var url = "wherever you hosted your data";
fetcher.nowOrWhenFetched(url, function(ok, body, xhr) {
  if (!ok) {
    console.log("Oops, something happened and couldn't fetch data");
  }
});
```
Then, data is loaded into the RDF store on the client side.
### Consume RDF data
I used [rdflib.js](https://github.com/linkeddata/rdflib.js/) to do stuff with the data. It can use SPARQL to query the local RDF store, which is neat. Most of my clickable items are powered by SPARQL. There is definitely a learning curve to use this library, especially if your query result contains multiple tuples. Generally, I found it helpful to first make sure that your SPARQL query is correct by running it on a SPARQL server, such as [Fuseki](https://jena.apache.org/documentation/serving_data/).
