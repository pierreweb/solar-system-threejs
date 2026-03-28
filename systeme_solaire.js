"use strict";

window.addEventListener("load", function () {
  var app = new v3d.App(
    "container",
    null,
    new v3d.SimplePreloader({ container: "container" }),
  );

  var url = "systeme_solaire.gltf.xz";
  //animationsRev=numéro des animations de Rev des planetes
  //nbrAnimation= nbr total d'animations dans le fichier gltf faire console.log(app.actions)
  var scene,
    nbrAnimation,
    animTerre,
    vitesseAnimations = 1,
    orbitPlanetes,
    datemilliseconde,
    compteurJours,
    animIsPaused = true,
    lights;
  var animationsRev = new Map();
  var animationsRot = new Map();

  app.loadScene(url, function () {
    app.enableControls();
    app.run();
    runCode();
  });

  function runCode() {
    //const nbrPlanetes=10;
    init();
    calculPositionPlanete("now");
    //console.log("app:", app);
    setTimeout(animate, 5000);
  }

  /*    async function calculPositionPlanete(date) {
        //https://fr.tutiempo.net/astronomie/vue-astronomique/systeme-solaire/
        //https://www.youtube.com/watch?v=lUCQgqc4K2A
        //http://vo.imcce.fr/webservices/miriade/?documentation
        //https://www.sitepoint.com/introduction-to-the-fetch-api/
        //http://vo.imcce.fr/webservices/miriade/?documentation#field_2
        https://ssp.imcce.fr/webservices/miriade/api/ephemcc.php?[parameters]
        //https://api.le-systeme-solaire.net/rest/
        //https://ssp.imcce.fr/webservices/miriade/api/ephemcc/#json-format
        console.log(date);
        var anglesPlanetes = new Map();
        const p="Planet",dp="Dwarf Planet",s="Satellite",a="Asteroid";
        
        //printemps 2019=2458563.5;-ep=now
        //ete 2019=2458655.5//automne 2019=2458747.5//hiver=2458838.5
      
        let planetes= new Map([["Mercure",p],["Venus",p],["Earth",p],["Lune",s],["Mars",p],["Ceres",a],["Jupiter",p],["Saturne",p],["Uranus",p],["Neptune",p],["Pluto",dp]])
       
        for (let[cle,valeur] of planetes) {
             console.log(cle+":"+valeur);
         
let url='https://ssp.imcce.fr/webservices/miriade/api/ephemcc.php?-name='+cle+'&-type='+valeur+'&-ep='+date+'&-tscale=UTC&-nbd=1&-step=1d&-rplane=2&-theory=INPOP&-teph=1&-mime=json&-tsat=IMCCE&-observer=@sun&-lang=fr&-from=ssp'    
          
          
            
            
            fetch(url)
                .then(response => response.json())
                    .then(jsonData => {
                        console.log("planete"+jsonData['sso']['name']+"angle"+jsonData['data'][0]['Longitude']);
                        let angleEnDegreeDecimal=convertToDegreDecimal(jsonData['data'][0]['Longitude']);
                        //dd = d + m/60 + s/3600
                        anglesPlanetes.set(jsonData['sso']['name'],(angleEnDegreeDecimal+ 90) % 360);//90 pour verge3d
                        
                    if (anglesPlanetes.size == planetes.size) {
                        console.log("anglesPlanetes:"+anglesPlanetes);
                        positionnePlanetes(anglesPlanetes);
                         };
                    
                                    })
                .catch(error => {
                    console.error('Une erreur s\'est produite lors de la requête :', error);
                                });
            
            
          
        }
    } */
  async function calculPositionPlanete(dateStr = "now") {
    console.log("function calculPositionPlanete1:" + dateStr);
    const anglesPlanetes = new Map();

    const planetes = [
      "p:Mercury",
      "p:Venus",
      "p:Earth",
      "s:Moon",
      "p:Mars",
      "a:Ceres",
      "p:Jupiter",
      "p:Saturn",
      "p:Uranus",
      "p:Neptune",
      "dp:Pluto",
    ];

    const base = "https://ssp.imcce.fr/webservices/miriade/api/ephemcc.php";

    function urlPlanete(nom, dateStr = "now") {
      return (
        base +
        "?-name=" +
        encodeURIComponent(nom) +
        "&-type=Planet" +
        "&-ep=" +
        dateStr + // ← ici tu mets ta date
        "&-nbd=1" +
        "&-step=1d" +
        "&-tscale=UTC" +
        "&-observer=@sun" +
        "&-rplane=2" +
        "&-teph=1" +
        "&-mime=json"
      );
    }

    function dmsToDeg(str) {
      const sign = str.trim().startsWith("-") ? -1 : 1;
      const parts = str.replace("+", "").replace("-", "").split(":");
      const d = parseFloat(parts[0]);
      const m = parseFloat(parts[1]);
      const s = parseFloat(parts[2]);
      return sign * (d + m / 60 + s / 3600);
    }

    for (let i = 0; i < planetes.length; i++) {
      const URL = urlPlanete(planetes[i], dateStr);

      try {
        const response = await fetch(URL, {
          method: "GET",
          cache: "no-cache",
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          console.error(planetes[i], "HTTP", response.status);
          continue;
        }

        const jsonData = await response.json();
        const lonStr = jsonData.data[0].Longitude; // ex: "+230:20:58.91968"
        const lonDeg = dmsToDeg(lonStr);

        const indexOfFirst = planetes[i].indexOf(":") + 1;
        const nomCourt = planetes[i].substring(indexOfFirst);

        anglesPlanetes.set(
          nomCourt,
          (lonDeg + 90) % 360, // ta correction Blender
        );

        if (anglesPlanetes.size === planetes.length) {
          positionnePlanetes(anglesPlanetes);
        }
      } catch (e) {
        console.error("Erreur pour", planetes[i], e);
      }
    }
  }

  function convertToDegreDecimal(angle) {
    let parties = angle.split(":");
    let degres = parseFloat(parties[0]);
    let minutes = parseFloat(parties[1]);
    let secondes = parseFloat(parties[2]);

    let degreDecimal = degres + minutes / 60 + secondes / 3600;

    return degreDecimal;
  }

  function positionnePlanetes(anglesPlanetes) {
    console.log("positionnePlaneteenter");
    for (var [key, value] of anglesPlanetes) {
      console.log(key + "=" + value);
      if (animationsRev.has(key)) {
        console.log("key" + key);
        app.actions[animationsRev.get(key)].time =
          (app.actions[animationsRev.get(key)]._clip.duration *
            anglesPlanetes.get(key)) /
          360;
      }
    }

    app.actions[animTerre].time =
      (app.actions[animTerre]._clip.duration *
        anglesPlanetes.get("Earth") *
        1.01447) /
      365.208;
    compteurJours = app.actions[animTerre].time; //action correspond à la terre =365,208jours
  }

  /*-------------------------------gestion de l animationRev----------------------------------------*/
  /*si je met boutons controles dans index mettre parent sinon il faut supprimer le parent*/
  /*  parent.document.getElementById("animationRevPlayPause").addEventListener("click", playpauseAnimRev);
     parent.document.getElementById("vitesseAnimations").addEventListener("click", vitesseChange);
     parent.document.getElementById("Orbit").addEventListener("click", afficherObjet);
     parent.document.getElementById("Ecliptique").addEventListener("click", afficherObjet); */
  document
    .getElementById("animationRevPlayPause")
    .addEventListener("click", playpauseAnimRev);
  document
    .getElementById("vitesseAnimations")
    .addEventListener("click", vitesseChange);
  document.getElementById("Orbit").addEventListener("click", afficherObjet);
  document
    .getElementById("Ecliptique")
    .addEventListener("click", afficherObjet);
  document
    .getElementById("lightsOffOn")
    .addEventListener("click", lightsChange);
  document.getElementById("changeDate").addEventListener("click", changeDate);

  function changeDate(e) {
    //arreter animation et mettre slider value a 0 et pause
    sliderValue[4].value = 1;
    output[4].textContent =
      sliderValue[4].value == 1
        ? ("PAUSE", (varAnimationRev = "PAUSE"))
        : ("PLAY", (varAnimationRev = "PLAY"));
    sliderValue[5].value = 1;
    output[5].textContent = varVitesseAnimations = sliderValue[5].value;
    // var evt = document.createEvent("MouseEvents");
    // evt.initEvent("click", true, true);
    // document.getElementById("animationRevPlayPause").dispatchEvent(evt);
    playpauseAnimRev();

    //afficher newdate dans le div temps
    var newDate = document.getElementById("dateinput").value; //alert("newDate" + newDate);
    var d = new Date(newDate); //alert(d);
    outputDate.innerHTML =
      jours[d.getDay()] +
      "." +
      d.getDate() +
      "." +
      mois[d.getMonth()] +
      "." +
      d.getFullYear(); //d.toDateString();
    //outputDate.innerHTML = days[d.getDay()] + '.' + d.getDate() + '.' + months[d.getMonth()] + '.' + d.getFullYear(); //d.toDateString();

    //changer en datemilliseconde utiliser dans afficheNewDate
    datemilliseconde = Date.parse(d); //alert("datemilliseconde" + datemilliseconde);
    //fermer fenetre modal
    modalDatePicker.style.display = "none";
    //mettre date now dans datepicker
    document.getElementById("dateinput").value = new Date()
      .toISOString()
      .slice(0, 10); //alert(new Date().toISOString().slice(0, 10));

    /* var dateControl = document.querySelector('input[type="date-input"]');//alert(dateControl);
        // console.log(btnChangeDate, e.currentTarget.parentElement.children[0].value);
        //var date = document.getElementById("dateinput").value + "T00:00:00";*/
    //envoyer date format iso8601 à calculPositionPlanete
    var date = newDate + "T00:00:00"; //alert(date);
    calculPositionPlanete(date);
  }
  /*----------------affiche date---------*/
  function afficheNewDate() {
    //24h=86400000 millisecondes
    //console.log("afficheNewDate");
    //compteursJours init calculer dans positionPlanete()
    //console.log(app.actions[animTerre].time);
    compteurJours =
      compteurJours - app.actions[animTerre].time < 0 ? compteurJours : 0;

    //datemilliseconde=datemilliseconde+(Math.max(app.actions[6].time-compteurJours,0))*86400000;
    datemilliseconde =
      datemilliseconde +
      (app.actions[animTerre].time - compteurJours) * 86400000;
    var d = new Date(datemilliseconde);
    compteurJours = app.actions[animTerre].time; //compteurJours=compteurJours%(compteurJoursReset);
    //sans iframe
    //outputDate.innerHTML = new Date(datemilliseconde).toISOString().slice(0, 10);
    //outputDate.innerHTML = jours[d.getDay()] + '.' + d.getDate() + '.' + mois[d.getMonth()] + '.' + d.getFullYear(); //d.toDateString();
    //outputDate.innerHTML = days[d.getDay()] + '.' + d.getDate() + '.' + months[d.getMonth()] + '.' + d.getFullYear(); //d.toDateString();
    outputDate.innerHTML =
      d.getDate() + "." + mois[d.getMonth()] + "." + d.getFullYear();

    //console.log(new Date(datemilliseconde).toISOString().slice(0, 10));
    //avec iframe
    // parent.outputDate.innerHTML = datemillisecondestring;
    //parent.outputDate.innerHTML=datemillisecondestring.getDay()+'.'+datemillisecondestring.getDate()+'.'+datemillisecondestring.getMonth()+'.'+datemillisecondestring.getFullYear();
  }

  /*--------masquer afficher objet---------------------*/
  function afficherObjet(e) {
    console.log("afficherObjet" + e.currentTarget.id);
    for (var i = 0; i < orbitPlanetes.length; i++) {
      //(0)=noop
      orbitPlanetes[i].visible =
        orbitPlanetes[i].name.search(e.currentTarget.id) < 0
          ? orbitPlanetes[i].visible
          : (orbitPlanetes[i].visible =
              e.currentTarget.value == 1 ? true : false);
    }
  }
  /*-------play ou pause animation rev-----------------*/
  function playpauseAnimRev() {
    //console.log("playpauseAnimRev"); //console.log(animationsRev);
    for (var [key, value] of animationsRev) {
      //console.log(animationsRev); /*le parent empeche fonctionne avec le iframe*/
      //app.actions[value].paused = (parent.varAnimationRev == "PAUSE") ? (true, animIsPaused = true) : (false, animIsPaused = false);
      app.actions[value].paused =
        varAnimationRev == "PAUSE"
          ? (true, (animIsPaused = true))
          : (false, (animIsPaused = false));
    }
    for (var [key, value] of animationsRot) {
      //console.log(animationsRev);
      app.actions[value].paused =
        varAnimationRev == "PAUSE"
          ? (true, (animIsPaused = true))
          : (false, (animIsPaused = false));
    }
  }

  function vitesseChange() {
    //console.log("vitesseChange");
    for (var [key, value] of animationsRev) {
      //console.log(animationsRev);
      app.actions[value].timeScale = varVitesseAnimations | 0;
    }
    for (var [key, value] of animationsRot) {
      //console.log(animationsRot);
      app.actions[value].timeScale = varVitesseAnimations | 0;
    }
  }

  /* function vitesseChange() {
        //console.log("vitesseChange");
        for (var [key, value] of animationsRev) {
            //console.log(animationsRev);             
            app.actions[value].timeScale = varVitesseAnimations | 0;
        }
    } */

  function lightsChange(e) {
    // console.log("lightsChange");
    for (var i = 0; i < lights.length; i++) {
      lights[i].visible = e.currentTarget.value == 0 ? 0 : 1;
      //console.log(lights[i]);
    }
  }

  function init() {
    //console.log("initenter");

    /* var dateNow=new Date().getFullYear();//console.log(dateNow);
        correctionDate=Date.parse(dateNow+"-01-01T00:00:00+0000");//console.log(correctionDate);
        //correctionDate=Date.now()-correctionDate; */
    datemilliseconde = Date.now(); // console.log(datemilliseconde);
    //compteurJoursReset=(app.actions[6]._clip.duration);

    nbrAnimation = app.actions.length; //console.log("nbrAniamtion:" + nbrAnimation);
    //bloom
    var paramsBloom = {
      exposure: 1,
      bloomStrength: 0.5,
      bloomThreshold: 20,
      bloomRadius: 1,
    };
    //bloom(paramsBloom.bloomThreshold,paramsBloom.bloomStrength,paramsBloom.bloomRadius);

    //brightness contrast
    var paramsBrigth = {
      brightness: 0.2,
      contrast: 0,
    };
    brightnessContrast(paramsBrigth.brightness, paramsBrigth.contrast);

    scene = app.scene;
    /* var light = new v3d.PointLight(0x00FF00, 100);
        var camera = scene.getObjectByName("Camera");
        camera.add(light); */
    //anim=app.animations
    //scene.background = new v3d.Color(0x055575);
    //console.log(app);
    //console.log(app.actions[0]);
    //app.actions[0]._startTime=20;//app.actions[0].paused=true;//console.log(app.actions);//console.log(app.actions[1]._clip.name);

    //Empty.Mars.Rev,Empty.Venus.Rev,Empty.Terre.Rev,Empty.Ceres.Rev,Empty.Jupiter.Rev,Empty.Saturne.Rev
    //Empty.Uranus.Rev,Empty.Neptune.Rev,Empty.Asteroide.Rev,Planete.Mercure

    //je note numero animation Rev correspondant à chaques planetes
    vitesseAnimations = varVitesseAnimations;
    //console.log("vitesseAnimations" + varVitesseAnimations);
    // var varVitesseAnimations = document.getElementById("varVitesseAnimations").innerText;

    for (var i = 0; i < nbrAnimation; i++) {
      app.actions[i].timeScale = vitesseAnimations; //reglage vitesse animation
      switch (app.actions[i]._clip.name) {
        case "Empty.Mars.Rev":
          animationsRev.set("Mars", i);
          console.log("Mars.Rev");
          break;
        case "Empty.Mars.Rot":
          animationsRot.set("Mars", i);
          console.log("Mars.Rot");
          break;
        case "Empty.Venus.Rev":
          animationsRev.set("Venus", i);
          console.log("Venus.Rev");
          break;
        case "Empty.Venus.Rot":
          animationsRot.set("Venus", i);
          console.log("Venus.Rot");
          break;
        case "Empty.Terre.Rev":
          animationsRev.set("Terre", i);
          animTerre = i; //utiliser pour afficherDate
          console.log("Terre.Rev");
          break;
        case "Empty.Terre.Rot":
          animationsRot.set("Terre", i);
          console.log("Terre.Rot");
          break;
        case "Empty.Terre.Lune.Rev":
          animationsRev.set("Terre.Lune", i);
          console.log("Terre.Lune.Rev");
          break;
        case "Empty.Terre.Lune.Rot":
          animationsRot.set("Terre.Lune", i);
          console.log("Terre.Lune.Rot");
          break;
        case "Empty.Ceres.Rev":
          animationsRev.set("Ceres", i);
          console.log("Ceres.Rev");
          break;
        case "Empty.Ceres.Rot":
          animationsRot.set("Ceres", i);
          console.log("Ceres.Rot");
          break;
        case "Empty.Jupiter.Rev":
          animationsRev.set("Jupiter", i);
          console.log("Jupiter.Rev");
          break;
        case "Empty.Jupiter.Rot":
          animationsRot.set("Jupiter", i);
          console.log("Jupiter.Rot");
          break;
        case "Empty.Saturne.Rev":
          animationsRev.set("Saturn", i); //Saturn et pas Saturne
          console.log("Saturn.Rev");
          break;
        case "Empty.Saturne.Rot":
          animationsRot.set("Saturn", i); //Saturn et pas Saturne
          console.log("Saturn.Rot");
          break;
        case "Empty.Uranus.Rev":
          animationsRev.set("Uranus", i);
          console.log("Uranus.Rev");
          break;
        case "Empty.Uranus.Rot":
          animationsRot.set("Uranus", i);
          console.log("Uranus.Rot");
          break;
        case "Empty.Neptune.Rev":
          animationsRev.set("Neptune", i);
          console.log("Neptune.Rev");
          break;
        case "Empty.Neptune.Rot":
          animationsRot.set("Neptune", i);
          console.log("Neptune.Rot");
          break;
        case "Empty.Soleil.Rot":
          animationsRot.set("Soleil", i);
          console.log("Soleil.Rot");
          break;
        case "Empty.Asteroide.Rev":
          animationsRev.set("Asteroide", i);
          console.log("Asteroide.Rev");
          break;
        case "Planete.Mercure":
          animationsRev.set("Mercury", i); //attention ici Mercury et pas Mercure et pas de rot
          console.log("Mercury");
          break;
        default:
        //console.log(animationsRev);
      }
    }

    /*ecliptique et orbites*/
    orbitPlanetes = [];
    var orbitePlanetesNames = [
      "Orbit.Mercure",
      "Orbit.Venus",
      "Orbit.Terre",
      "Orbit.Terre.Lune",
      "Orbit.Mars",
      "Orbit.Ceres",
      "Orbit.Jupiter",
      "Orbit.Saturne",
      "Orbit.Uranus",
      "Orbit.Neptune",
      "Ecliptique",
    ];
    for (var i = 0; i < orbitePlanetesNames.length; i++) {
      orbitPlanetes.push(scene.getObjectByName(orbitePlanetesNames[i]));
    } //console.log("orbitesplanetes:"+(orbitPlanetes));

    /*lights*/
    lights = [];
    var lightsNames = [
      "Sun.Back",
      "Sun.Bottom",
      "Sun.Left",
      "Sun.Top",
      "Sun.Right",
      "Sun.Front.pourreglage",
    ];
    for (var i = 0; i < lightsNames.length; i++) {
      lights.push(scene.getObjectByName(lightsNames[i]));
    } //console.log("lights:"+(lightsNames));

    /*animation Rev en pause*/
    playpauseAnimRev();
    sliderValue[3].value = 1;
    output[3].textContent = sliderValue[3].value == 1 ? "ON" : "OFF";

    document.getElementById("Orbit").click();
    document.getElementById("Ecliptique").click();
    //console.log("initexit");
  }

  /*--------------------animation request animation tous les  1/60 eme de seconde---------------*/
  function animate() {
    //console.log("animate");
    requestAnimationFrame(animate);
    //render();
    //stats.update();
    //console.log(app.actions[6].time |0);
    if (!animIsPaused) afficheNewDate();
  }

  /*-------------------------------------------bloom-------------------------------------------*/
  function bloom(threshold, strength, radius) {
    app.enablePostprocessing([
      {
        type: "bloom",
        threshold: threshold,
        strength: strength,
        radius: radius,
      },
    ]);
  }

  /*-----------------------brightnessContrast-------------------*/
  function brightnessContrast(brightness, contrast) {
    app.enablePostprocessing([
      {
        type: "brightnessContrast",
        brightness: brightness,
        contrast: contrast,
      },
    ]);
  }
});
