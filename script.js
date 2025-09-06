let panier = JSON.parse(localStorage.getItem('panier')) || [];
let catalogue = []; // On va charger produits.json

// Charger produits.json
fetch('produits.json')
  .then(res => res.json())
  .then(data => {
    catalogue = data;
    afficherCatalogue();
    afficherPanier();
  });

// Afficher le catalogue
function afficherCatalogue() {
  const divCat = document.getElementById('catalogue');
  divCat.innerHTML = '';
  catalogue.forEach(p => {
    const produitDiv = document.createElement('div');
    produitDiv.classList.add('produit');
    produitDiv.innerHTML = `
      <img src="${p.image}" width="150" />
      <p>${p.nom}</p>
      <p>${p.prix} €</p>
      ${p.obligatoire ? `<input type="text" id="text${p.id}" placeholder="Modèle obligatoire" />` : ''}
      <button onclick="ajouterAuPanier(${p.id})">Ajouter au panier</button>
    `;
    divCat.appendChild(produitDiv);
  });
}

// Ajouter au panier
function ajouterAuPanier(id) {
  const produit = catalogue.find(p => p.id === id);
  const texte = document.getElementById(`text${id}`)?.value || '';

  if (produit.obligatoire && texte.trim() === '') {
    alert('Veuillez spécifier le modèle de votre téléphone pour la coque personnalisée.');
    return;
  }

  panier.push({...produit, texte});
  savePanier();
  afficherPanier();
  afficherNotification(`${produit.nom} ajouté au panier !`);
}

// Afficher le panier
function afficherPanier() {
  const divPanier = document.getElementById('panier');
  if(panier.length === 0){
    divPanier.innerHTML = 'Panier vide';
    return;
  }
  divPanier.innerHTML = '';
  panier.forEach((p,i) => {
    const pDiv = document.createElement('div');
    pDiv.textContent = `${p.nom} - ${p.prix} € ${p.texte ? `(Texte: ${p.texte})` : ''}`;
    const btn = document.createElement('button');
    btn.textContent = 'Supprimer';
    btn.onclick = () => { panier.splice(i,1); savePanier(); afficherPanier(); };
    pDiv.appendChild(btn);
    divPanier.appendChild(pDiv);
  });
  const total = panier.reduce((sum,p)=>sum+p.prix,0);
  divPanier.innerHTML += `<p>Total : ${total.toFixed(2)} €</p>`;
}

// Sauvegarder panier
function savePanier() { localStorage.setItem('panier', JSON.stringify(panier)); }

// Notification simple
function afficherNotification(msg) {
  const notif = document.createElement('div');
  notif.textContent = msg;
  notif.style.position = 'fixed';
  notif.style.top = '10px';
  notif.style.right = '10px';
  notif.style.background = '#4CAF50';
  notif.style.color = '#fff';
  notif.style.padding = '10px';
  notif.style.borderRadius = '5px';
  document.body.appendChild(notif);
  setTimeout(()=>notif.remove(),2000);
}

// EmailJS commande
document.getElementById('commandeForm').addEventListener('submit', function(e){
  e.preventDefault();
  const nom = document.getElementById('nom').value;
  const email = document.getElementById('email').value;
  const telephone = document.getElementById('telephone').value;
  const adresse = document.getElementById('adresse').value;

  if(panier.length === 0){
    alert('Votre panier est vide !');
    return;
  }

  let contenuCommande = panier.map(p => `${p.nom} - ${p.prix} €${p.texte ? ' (Texte: '+p.texte+')':''}`).join('\n');
  let total = panier.reduce((sum,p)=>sum+p.prix,0);

  const templateParams = {
    nom, email, telephone, adresse,
    commande: contenuCommande,
    total: total.toFixed(2)
  };

  emailjs.send('service_mmnhfh4','template_6czm9no',templateParams)
    .then(res => {
      alert('Commande envoyée avec succès ! Vérifie ton email.');
      panier = [];
      savePanier();
      afficherPanier();
    }, err => {
      alert('Erreur lors de l’envoi de la commande. Essaie de nouveau.');
      console.error(err);
    });
});
