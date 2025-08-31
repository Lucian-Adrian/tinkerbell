Raport de Re-arhitecturare Strategică: Simplificarea Arhitecturii MVP prin Integrarea Nativă a Google GeminiCuvânt Înainte: O Cale de Ieșire din ComplexitateContext: Stadiul actual al dezvoltării produsului minim viabil (MVP) se confruntă cu un obstacol critic: o arhitectură tehnică formată dintr-un backend FastAPI, un broker de mesaje Redis și un proces Worker dedicat. Această configurație, deși teoretic capabilă, s-a dovedit a fi fragilă, complexă și o sursă constantă de dificultăți în procesul de depanare ("debug hell"). Această fricțiune tehnică încetinește iterația și pune în pericol agilitatea necesară în faza de MVP.Ipoteza Strategică: Există o ipoteză fundamentală conform căreia capabilitățile native avansate ale API-ului Google Gemini — în special gestionarea asincronă, generarea de output structurat, streaming-ul și uneltele integrate pentru procesarea surselor externe — ar putea elimina în totalitate necesitatea pentru stratul de complexitate reprezentat de Redis și Worker. Această simplificare ar conduce la un sistem mai robust, mai ușor de întreținut și, crucial, mai rapid de dezvoltat și de implementat.Obiectivul Raportului: Prezentul document constituie un raport de re-arhitecturare strategică, elaborat de un Arhitect Principal AI. Misiunea sa este de a executa o analiză aprofundată și de a oferi o validare sau invalidare, bazată pe dovezi tehnice concrete, a ipotezei strategice enunțate. Raportul culminează cu un plan de acțiune clar și un blueprint tehnic detaliat, conceput pentru a ghida echipa de dezvoltare în tranziția către o arhitectură simplificată, ieșind astfel din impasul tehnic actual.Secțiunea 1: Analiza Arhitecturii Asincrone: O Decizie Strategică între async/await și Prelucrarea în FundalAceastă secțiune analizează fezabilitatea și riscurile asociate cu înlocuirea completă a sistemului de worker cu apeluri asincrone directe în endpoint-urile FastAPI, pentru sarcini cu o durată de execuție estimată între 10 și 60 de secunde.1.1 Fundamente: Dinamica Sarcinilor de Lungă Durată în FastAPIPentru a lua o decizie arhitecturală informată, este esențială înțelegerea modului în care FastAPI gestionează concurența. Framework-ul este construit pe baza asyncio, biblioteca standard Python pentru scrierea de cod concurent folosind sintaxa async/await.1Event Loop-ul asyncio: Inima fiecărui proces (worker) FastAPI este un "event loop" (buclă de evenimente). Acesta acționează ca un manager de sarcini extrem de eficient, dar care poate gestiona o singură sarcină la un moment dat. Puterea sa constă în abilitatea de a comuta contextul. Când o funcție async ajunge la o operațiune de așteptare (marcată cu await), cum ar fi un apel de rețea către API-ul Gemini sau o interogare a bazei de date, event loop-ul nu rămâne blocat. În schimb, pune sarcina curentă în așteptare și preia o altă sarcină gata de execuție. Când răspunsul de la rețea sosește, sarcina inițială este marcată din nou ca fiind gata și va fi reluată de event loop la următoarea oportunitate.2 Acest model este ideal pentru sarcinile I/O-bound (limitate de intrare/ieșire), deoarece maximizează utilizarea procesorului în timpul perioadelor de așteptare. Apelul către API-ul Gemini este un exemplu perfect de sarcină I/O-bound.Pericolul Sarcinilor CPU-bound: O distincție critică trebuie făcută față de sarcinile CPU-bound (limitate de procesor), cum ar fi calcule matematice complexe, procesarea locală a unei imagini sau o buclă for care execută un număr mare de iterații. Dacă o astfel de sarcină este executată direct într-o funcție async def, ea va monopoliza event loop-ul. Deoarece nu există un moment de await în care controlul să poată fi cedat, întregul proces worker va "îngheța", devenind incapabil să preia noi cereri sau să continue alte sarcini concurente până la finalizarea calculului intensiv.2Diferența între def și async def în FastAPI: FastAPI este proiectat inteligent pentru a gestiona ambele tipuri de funcții. În timp ce funcțiile async def rulează direct pe event loop, funcțiile sincrone, definite cu def, sunt executate de FastAPI într-un thread pool separat. Acest mecanism ingenios previne blocarea event loop-ului de către codul sincron blocant. Totuși, deși acest lucru protejează performanța serverului și capacitatea sa de a răspunde la alte cereri, nu rezolvă problema fundamentală a unei cereri HTTP care rămâne deschisă pentru o perioadă lungă de timp, așteptând finalizarea sarcinii din thread-ul separat.1Prin urmare, modelul de programare async/await este perfect adecvat pentru natura apelului către API-ul Gemini (I/O-bound). Întrebarea strategică nu este dacă async/await este corect, ci dacă contextul arhitectural — un ciclu de cerere-răspuns HTTP sincron — este un mediu robust pentru a aștepta finalizarea unor astfel de apeluri de lungă durată.1.2 Evaluarea Riscurilor de Producție: Capcana Timeout-urilor în CascadăIdeea de a simplifica arhitectura prin eliminarea worker-ului și executarea unui await client.aio.models.generate_content(...) direct în endpoint este atractivă. Totuși, această abordare introduce un risc semnificativ și inacceptabil pentru un mediu de producție, din cauza timeout-urilor.Timeout-ul SDK-ului Gemini: Primul nivel de timeout este cel al clientului SDK. Cercetarea confirmă că, în urma rezolvării unei probleme pe GitHub 5, SDK-ul google-genai permite acum configurarea unui timeout personalizat. Acesta poate fi setat la inițializarea clientului prin intermediul parametrului http_options, oferind control asupra duratei maxime de așteptare pentru un răspuns de la API-ul Google.6 De exemplu, pentru a seta un timeout de 3 minute:Pythonfrom google import genai
from google.genai.types import HttpOptions

# Timeout setat la 180 de secunde
client = genai.Client(
    api_key="YOUR_API_KEY",
    http_options=HttpOptions(timeout=180)
)
Aceasta este o veste bună, dar rezolvă doar o mică parte a problemei.Adevăratul Pericol: Timeout-urile Infrastructurii: Într-o arhitectură de producție, aplicația FastAPI nu este expusă direct internetului. Ea se află în spatele mai multor straturi de infrastructură de rețea: load balancers (ex: AWS Application Load Balancer, Google Cloud Load Balancer), reverse proxies (ex: Nginx), gateway-uri API sau servicii CDN (ex: Cloudflare). Fiecare dintre aceste componente are propriul său mecanism de timeout pentru conexiuni inactive (idle timeout). Aceste timeout-uri sunt de obicei setate la valori implicite de 60 sau 120 de secunde.8O cerere HTTP care așteaptă un răspuns de la Gemini timp de 55 de secunde este, din perspectiva unui load balancer, o conexiune inactivă. Nu se transferă date între client și server. Când acest prag de inactivitate este depășit, load balancer-ul va închide forțat conexiunea, trimițând clientului o eroare 504 Gateway Timeout. Acest lucru se va întâmpla indiferent dacă procesul FastAPI și API-ul Gemini ar fi continuat procesarea și ar fi returnat un rezultat valid câteva secunde mai târziu.9 Încercarea de a crește aceste timeout-uri la nivel de infrastructură este adesea nepractică, costisitoare și contravine bunelor practici de proiectare a sistemelor scalabile.Această nealiniere între modelul de interacțiune (o cerere HTTP de lungă durată) și constrângerile infrastructurii moderne este sursa principală de fragilitate. Arhitectura actuală, cu Redis și Worker, modelează corect sarcina ca fiind asincronă. Ipoteza simplificării prin await direct în endpoint o remodelează, incorect, ca fiind o operațiune sincronă, expunând-o acestui risc critic.1.3 Recomandare Strategică: Modelul "Acceptă Imediat, Procesează în Fundal"Pe baza analizei riscurilor, ipoteza că un simplu await într-un endpoint FastAPI este o soluție robustă pentru sarcini de 10-60 de secunde este invalidată. O astfel de abordare este viabilă pentru sarcini foarte scurte (sub 10-15 secunde), dar devine progresiv mai riscantă pe măsură ce durata crește, fiind nerecomandată pentru producție în cazul sarcinilor care se apropie de 60 de secunde.Se impune o soluție care decuplează ciclul de viață al cererii HTTP de execuția sarcinii de lungă durată.Alternativa Heavy-Duty (Celery): Celery este considerat standardul industriei pentru procesarea asincronă a sarcinilor în Python. Oferă un set complet de funcționalități: persistența sarcinilor (dacă worker-ul se restartează, sarcinile nu se pierd), mecanisme de reîncercare, monitorizare avansată (prin interfața web Flower) și capacitatea de a scala worker-ii pe mai multe mașini. Cu toate acestea, introducerea Celery implică gestionarea unui broker de mesaje (precum Redis sau RabbitMQ) și a unui proces worker separat, adăugând exact complexitatea operațională pe care proiectul dorește să o elimine în faza de MVP.12Calea de Mijloc Pragmatică (BackgroundTasks): FastAPI oferă o soluție nativă, elegantă și mult mai simplă: clasa BackgroundTasks. Aceasta permite programarea unei funcții pentru a fi executată în fundal, după ce răspunsul HTTP a fost deja trimis către client. Sarcina rulează în același proces ca și aplicația FastAPI, dar pe un thread separat (dacă este o funcție def) sau pe același event loop (dacă este async def), dar fără a bloca returnarea răspunsului.17Beneficii:Simplitate Maximă: Nu necesită dependențe externe precum Redis. Nu există procese worker separate de configurat, implementat și monitorizat.Răspuns Imediat: Endpoint-ul API poate returna instantaneu un cod de stare 202 Accepted și un identificator unic pentru sarcină (task_id), oferind o experiență de utilizator fluidă și receptivă.Robustețe: Elimină complet riscul de timeout-uri la nivel de infrastructură, deoarece conexiunea HTTP este închisă în câteva milisecunde.Limitări (Acceptabile pentru un MVP):Lipsa Persistenței: Dacă procesul FastAPI se restartează din orice motiv, sarcinile care se aflau în coada de execuție se vor pierde. Acesta este un compromis acceptabil pentru multe aplicații în stadiul de MVP.Monitorizare Limitată: Nu există o interfață de monitorizare pre-construită, precum Flower. Starea sarcinilor trebuie gestionată manual, de obicei prin scrierea stării (PENDING, PROCESSING, COMPLETED, FAILED) într-o bază de date.Resurse Partajate: Deoarece sarcinile rulează în același proces ca și serverul web, sarcinile extrem de intensive din punct de vedere al CPU sau al memoriei ar putea, teoretic, să afecteze performanța API-ului. Totuși, deoarece apelul la Gemini este I/O-bound, acest risc este minim.Concluzie: Pentru stadiul de MVP, BackgroundTasks reprezintă echilibrul optim între simplitatea arhitecturală dorită, viteza de dezvoltare și robustețea necesară în producție. Această abordare elimină dependențele complexe (Redis, Worker), dar evită capcanele unei implementări await naive, oferind o cale clară și sigură pentru a avansa.Secțiunea 2: Validarea Capabilităților Native Gemini pentru Cipurile de Utilizare "Tinkerbell"Această secțiune validează, cu exemple de cod concrete, cum pot fi utilizate funcționalitățile native ale API-ului Gemini pentru a implementa cazurile de utilizare specifice proiectului, denumite "Tinkerbell".2.1 Generarea de Strategii: Obținerea unui JSON Robust și ConformO cerință esențială este capacitatea de a obține de la model un output în format JSON, cu o structură predefinită și validă.Analiza Comparativă a Metodelor:Există trei abordări principale pentru a obține un output JSON, cu grade diferite de robustețe:Prompt Engineering (Ingineria Promptului): Aceasta este metoda tradițională, în care se solicită modelului în limbaj natural să returneze un răspuns formatat ca JSON. De exemplu: "Returnează răspunsul tău DOAR în format JSON, fără alt text explicativ." Această metodă este fragilă și nerecomandată pentru producție. Modelul poate adăuga text suplimentar ("Here is the JSON you requested:"), poate omite acolade sau virgule, sau poate genera un JSON invalid din punct de vedere sintactic, necesitând o logică complexă și predispusă la erori de post-procesare și validare.20response_mime_type="application/json": Aceasta este o directivă mai puternică, în care se specifică în configurația apelului API că se așteaptă un răspuns de tip MIME application/json. Aceasta instruiește modelul să genereze un output care este, în general, un JSON valid din punct de vedere sintactic. Totuși, nu oferă nicio garanție cu privire la structura (schema) JSON-ului — câmpurile, tipurile de date sau obligativitatea acestora.response_schema (Câștigătorul Clar): Aceasta este cea mai modernă și robustă metodă, cunoscută și sub numele de "controlled generation" (generare controlată). Permite definirea unei scheme exacte, conform unui subset al specificației OpenAPI 3.0, pe care modelul este obligat să o respecte. API-ul Gemini va garanta că textul returnat nu este doar un JSON valid, ci și că respectă întocmai structura, câmpurile, tipurile de date și constrângerile definite în schemă. Această abordare elimină practic necesitatea validării structurii în codul aplicației, simplificând drastic procesarea.20Tabel 1: Comparația Metodelor de Generare JSONMetodăRobustețeComplexitate ImplementareNecesitate Post-ProcesareRecomandarePrompt EngineeringScăzutăScăzutăRidicată (parsing, validare, curățare)Nerecomandatresponse_mime_typeMedieScăzutăMedie (validare schemă)Acceptabil, dar inferiorresponse_schemaRidicatăMedie (necesită definirea schemei)Scăzută (doar deserializare)Recomandat pentru ProducțieExemplu de Cod Funcțional (Pydantic + response_schema):Sinergia dintre modelele Pydantic ale FastAPI și capacitatea SDK-ului google-genai de a accepta tipuri Python pentru response_schema permite o implementare extrem de elegantă și sigură din punct de vedere al tipurilor.Se poate defini un singur model Pydantic care servește trei scopuri:Definește schema pentru Gemini.Oferă type-hinting pentru rezultatul deserializat.Servește ca response_model pentru endpoint-ul FastAPI care va returna datele.Pythonimport pydantic
from typing import List
from google import genai

# 1. Definirea schemei folosind modele Pydantic
class Ingredient(pydantic.BaseModel):
    name: str = pydantic.Field(description="Numele ingredientului.")
    quantity: float = pydantic.Field(description="Cantitatea necesară.")
    unit: str = pydantic.Field(description="Unitatea de măsură (ex: grame, ml, bucăți).")

class StrategyStep(pydantic.BaseModel):
    step_number: int = pydantic.Field(description="Numărul pasului în proces.")
    description: str = pydantic.Field(description="Descrierea detaliată a pasului.")

class MarketingStrategy(pydantic.BaseModel):
    strategy_name: str = pydantic.Field(description="Numele strategiei de marketing.")
    target_audience: str = pydantic.Field(description="Publicul țintă vizat de strategie.")
    required_budget: float = pydantic.Field(description="Bugetul estimat în EUR.")
    steps: List
    # Exemplu de utilizare a unui model imbricat
    # required_ingredients: List[Ingredient] # Se poate adăuga dacă este relevant

# Funcția care va fi executată în fundal
async def generate_strategy_json(prompt: str) -> MarketingStrategy:
    """
    Generează o strategie de marketing în format JSON structurat,
    folosind response_schema.
    """
    client = genai.Client() # Asigură-te că API_KEY este setat în mediu

    response = await client.models.generate_content_async(
        model="gemini-2.5-flash",
        contents=prompt,
        generation_config={
            "response_mime_type": "application/json",
            # 2. Trecerea modelului Pydantic direct ca schemă
            "response_schema": MarketingStrategy,
        }
    )

    # Gemini garantează că response.text este un JSON valid conform schemei
    # Pydantic se ocupă de deserializare și validarea datelor
    strategy_object = MarketingStrategy.parse_raw(response.text)
    
    # 3. Se poate lucra direct cu obiectul Python tipizat
    print(f"Strategie generată: {strategy_object.strategy_name}")
    print(f"Buget necesar: {strategy_object.required_budget} EUR")

    return strategy_object
Această abordare este superioară deoarece creează o arhitectură mentenabilă, cu un singur punct de adevăr (single source of truth) pentru structura datelor, asigurând siguranța tipurilor de la generarea AI până la serializarea în API.2.2 Analiza de Surse Externe: Înlocuirea Scraping-ului cu Unelte NativeCapacitatea de a raționa pe baza unor documente PDF și a conținutului unor pagini web este fundamentală. Uneltele native Gemini elimină necesitatea unui strat de pre-procesare manuală (scraping, parsare), simplificând dramatic arhitectura.Procesarea Fișierelor PDF (File API): Abordarea corectă pentru analiza PDF-urilor este utilizarea File API. Fluxul este simplu și eficient, în special pentru fișiere de mari dimensiuni (până la 50MB) 23:Upload: Fișierul PDF este încărcat către serverele Google folosind client.files.upload(path=...).Obținerea Referinței: Apelul returnează un obiect File care conține un URI unic. Acest obiect acționează ca o referință (un "handle") către fișierul încărcat.Utilizare în Prompt: Obiectul File este inclus direct în lista de conținut (contents) a promptului trimis către model. Modelul va accesa și procesa conținutul fișierului pe baza acestei referințe.Procesarea URL-urilor (Grounding): Pentru a analiza conținutul unei pagini web publice, nu este necesar un scraper. Modelele Gemini recente pot accesa și interpreta conținutul URL-urilor furnizate direct în prompt.24 Pentru scenarii mai avansate, unde este necesară ancorarea răspunsurilor în informații web actuale și citarea surselor, se poate activa unealta google_search.26Exemplu de Cod Compozit (Text + PDF + URL):Puterea reală a Gemini constă în capacitatea sa de a procesa un prompt multimodal compus din mai multe părți (Part). Următorul exemplu demonstrează cum se poate construi o singură cerere care combină inputul text al utilizatorului, un fișier PDF local și un URL public.Pythonimport google.generativeai as genai
import asyncio

# Asigură-te că API_KEY este setat în variabilele de mediu
# genai.configure(api_key="YOUR_API_KEY")

async def analyze_multiple_sources(user_prompt: str, pdf_path: str, external_url: str):
    """
    Analizează simultan text, un fișier PDF și un URL într-un singur apel Gemini.
    """
    client = genai.Client()
    
    # Pasul 1: Încarcă fișierul PDF folosind File API
    print(f"Încărcare fișier: {pdf_path}...")
    # Pentru apeluri asincrone, se folosește client.files
    uploaded_pdf_file = await asyncio.to_thread(client.files.upload, path=pdf_path)
    print(f"Fișier încărcat cu succes. URI: {uploaded_pdf_file.uri}")

    # Pasul 2: Construiește promptul compozit
    # 'contents' este o listă care poate conține text, imagini, sau referințe la fișiere
    prompt_parts =

    # Pasul 3: Generează conținutul
    print("Trimitere prompt compozit către Gemini...")
    model = client.models.get("gemini-1.5-flash") # Folosim un model capabil de context lung
    response = await model.generate_content_async(prompt_parts)

    # Pasul 4: Șterge fișierul de pe serverele Google după utilizare (bună practică)
    print(f"Ștergere fișier de pe server: {uploaded_pdf_file.name}")
    await asyncio.to_thread(client.files.delete, name=uploaded_pdf_file.name)

    return response.text

# Exemplu de utilizare
# presupunem că avem un fișier 'raport_anual.pdf' în directorul curent
# final_summary = await analyze_multiple_sources(
#     user_prompt="Pe baza raportului anual atașat și a articolului de presă, "
#                 "creează un sumar de 5 puncte cheie pentru ședința consiliului.",
#     pdf_path="raport_anual.pdf",
#     external_url="https://www.example.com/press-release-q4"
# )
# print("\n--- Rezumat Final ---\n")
# print(final_summary)
Această abordare reprezintă o schimbare de paradigmă de la "pre-procesează și apoi trimite la AI" la "trimite sursele brute direct la AI". Complexitatea legată de extragerea și curățarea datelor este complet externalizată către infrastructura Google, rezultând într-o reducere masivă a codului și a punctelor de eșec în cadrul aplicației.2.3 Generarea de Materiale Vizuale: Integrarea Simplificată a ImagenO altă cerință este generarea simultană a unei strategii (text) și a unei imagini de previzualizare corespunzătoare.Apel Unic, Răspuns Multi-Modal: Acest lucru este posibil și reprezintă o funcționalitate puternică a modelelor de generare de imagini din familia Gemini (care integrează tehnologia Imagen). Se poate realiza o singură cerere API care returnează atât text, cât și una sau mai multe imagini.Cheia Implementării: Secretul constă în configurarea corectă a apelului API. În obiectul generation_config, trebuie specificat parametrul response_modalities ca fiind o listă ce conține 'TEXT' și 'IMAGE'.28Pythonconfig = {
    "response_modalities":
}
Procesarea Răspunsului: Răspunsul primit de la API va avea o structură multi-part. Obiectul response.candidates.content.parts va fi o listă care conține elemente de diferite tipuri. Codul client trebuie să itereze prin această listă și să identifice tipul fiecărei părți:Dacă o parte are un atribut text non-nul, conține textul generat.Dacă o parte are un atribut inline_data non-nul, conține datele imaginii, de obicei ca un șir de caractere codificat în base64, care poate fi decodificat și salvat ca fișier imagine.29Exemplu de Cod Funcțional:Pythonimport google.generativeai as genai
from google.generativeai.types import GenerateContentConfig, Modality
from PIL import Image
from io import BytesIO
import base64

async def generate_strategy_with_preview_image(prompt: str):
    """
    Generează o strategie text și o imagine de previzualizare într-un singur apel.
    """
    client = genai.Client()
    
    # Utilizăm un model specific pentru generare de imagini
    # Numele modelelor se pot schimba; verificați documentația pentru cele mai recente versiuni
    model = client.models.get("gemini-2.0-flash-preview-image-generation")
    
    print("Trimitere prompt pentru text și imagine...")
    response = await model.generate_content_async(
        contents=prompt,
        generation_config=GenerateContentConfig(
            response_modalities=
        )
    )

    generated_text = None
    generated_image = None

    # Procesăm răspunsul multi-part
    for part in response.candidates.content.parts:
        if part.text:
            generated_text = part.text
        elif part.inline_data:
            # inline_data conține imaginea
            image_bytes = part.inline_data.data
            generated_image = Image.open(BytesIO(image_bytes))

    return generated_text, generated_image

# Exemplu de utilizare
# strategy_text, preview_image = await generate_strategy_with_preview_image(
#     prompt="Creează o scurtă strategie de marketing pentru lansarea unui nou suc natural "
#            "de portocale numit 'Zesty Zing'. Generează și o imagine de produs "
#            "cu o sticlă de suc pe un fundal luminos, cu felii de portocală în jur."
# )

# if strategy_text:
#     print("\n--- Strategie Text ---\n")
#     print(strategy_text)

# if preview_image:
#     print("\nImagine generată. Se salvează ca 'preview.png'...")
#     preview_image.save("preview.png")
#     # preview_image.show() # Pentru a afișa imaginea local
Această capacitate de a genera "artefacte AI compuse" într-o singură operațiune atomică este un avantaj major. Asigură coerența semantică între componenta textuală și cea vizuală, deoarece ambele sunt generate din aceeași înțelegere contextuală a modelului. Se elimină astfel necesitatea unui flux în doi pași (generare text, apoi construire prompt nou pentru imagine), reducând latența și riscul de neconcordanțe.Secțiunea 3: Propunere de Nouă Arhitectură: Un Blueprint pentru Viteză și RobustețeAceastă secțiune prezintă blueprint-ul concret pentru noua arhitectură simplificată, incluzând diagrama, descrierea componentelor și un flux detaliat al unei cereri end-to-end. Acesta este conținutul propus pentru noul fișier architecture.md.3.1 Livrabil: Noul architecture.mdArhitectura Sistemului (Versiunea 2.0 - Simplificată cu Gemini)Sumar ExecutivAceastă documentație descrie arhitectura simplificată a aplicației, revizuită pentru a valorifica la maximum capabilitățile native ale API-ului Google Gemini. Prin eliminarea dependențelor externe (Redis) și a procesului worker dedicat, noua arhitectură este semnificativ mai simplă, mai robustă și permite o viteză de dezvoltare crescută. Sistemul se bazează pe un backend FastAPI care utilizează BackgroundTasks pentru procesările de lungă durată și un model de interacțiune cu clientul bazat pe sondare (polling) pentru a prelua rezultatele asincrone.Diagrama ArhitecturalăDiagrama de mai jos ilustrează fluxul principal de date și componentele sistemului:text+-----------+      (1. HTTPS API Request)      +--------------------------------+      (6. Async API Call)      +-----------------+| | -------------------------------> | | --------------------------> | || Frontend | | Backend (FastAPI on Cloud Run) | | Google Gemini || (Web App) | <------------------------------- | - API Endpoints | <-------------------------- | API || | (2. 202 Accepted + task_id) | - BackgroundTasks | (7. Response) | (Text, JSON, |+-----------+  (8. Poll Status w/ task_id) | - DB Integration (PostgreSQL) | | Image, etc.) |^      <-------------------------------  +----------------|-----------------+                             +-----------------+| (9. 200 OK + Final Result) || | (3, 5, 8. Read/Write Task Status & Result)+---------------------------------------------------------+v+-------------+| || Database || (PostgreSQL)|+-------------+
## Componente Principale

1.  **Frontend (Aplicație Web):** Interfața cu utilizatorul, responsabilă pentru colectarea datelor de intrare (text, fișiere) și pentru afișarea rezultatelor. Interacționează cu Backend-ul prin cereri HTTP API.
2.  **Backend (FastAPI pe Cloud Run/alt serviciu de containere):** Nucleul aplicației. Un singur serviciu containerizat care expune endpoint-uri RESTful. Responsabilitățile sale includ:
    *   **Validarea Cererilor:** Utilizează modele Pydantic pentru a valida datele primite de la client.
    *   **Orchestrarea Sarcinilor:** Primește cererile, le înregistrează în baza de date și le deleagă pentru execuție în fundal.
    *   **Execuția în Fundal:** Folosește mecanismul nativ `BackgroundTasks` pentru a executa apelurile de lungă durată către API-ul Gemini, fără a bloca răspunsul inițial.
    *   **Interfața cu Baza de Date:** Comunică cu baza de date pentru a persista starea și rezultatele sarcinilor.
3.  **Database (ex: PostgreSQL):** O bază de date relațională standard, responsabilă pentru persistența datelor. Conține cel puțin o tabelă `tasks` pentru a urmări ciclul de viață al fiecărei sarcini asincrone (ID, status, data creării, data finalizării, rezultat, mesaj de eroare).
4.  **Google Gemini API (Serviciu Extern):** Serviciul PaaS (Platform as a Service) gestionat de Google, care efectuează procesarea AI. Backend-ul nostru acționează ca un client pentru acest serviciu.

## Fluxul Detaliat al unei Cereri Complexe (End-to-End)

Următorul flux descrie pas cu pas cum este procesată o cerere complexă, cum ar fi generarea unei strategii bazate pe text, un PDF și un URL.

1.  **Inițierea Cererii (Frontend -> Backend):** Utilizatorul completează un formular în aplicația web, furnizând un prompt text, încărcând un fișier PDF și introducând un URL. La trimitere, Frontend-ul face o cerere `POST` către un endpoint din Backend, de exemplu `/api/v1/strategies`.

2.  **Acceptare și Răspuns Imediat (Backend):**
    *   Endpoint-ul FastAPI primește cererea. Datele sunt validate automat folosind un model Pydantic.
    *   Backend-ul creează imediat o nouă înregistrare în tabela `tasks` din baza de date. Această înregistrare primește un `task_id` unic (ex: un UUID) și starea inițială `PENDING`.
    *   Backend-ul returnează **imediat** un răspuns `202 Accepted` către Frontend. Corpul răspunsului conține `task_id`-ul, permițând clientului să urmărească progresul.
        ```json
        {
          "task_id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
          "status": "PENDING"
        }
        ```

3.  **Lansarea Sarcinii în Fundal (Backend):** Chiar înainte de a trimite răspunsul `202`, endpoint-ul adaugă sarcina de procesare în coada `BackgroundTasks`.
    ```python
    # În interiorul endpoint-ului FastAPI
    background_tasks.add_task(
        process_strategy_generation, 
        task_id=new_task.id, 
        user_data=payload
    )
    return {"task_id": new_task.id, "status": "PENDING"}
    ```

4.  **Execuția Asincronă (Backend, în fundal):** *După* ce răspunsul a fost trimis și conexiunea HTTP închisă, FastAPI execută funcția `process_strategy_generation`. Această funcție:
    *   Actualizează starea sarcinii în baza de date la `PROCESSING`.
    *   Pregătește promptul compozit pentru Gemini: încarcă PDF-ul la File API, combină referința la fișier cu textul utilizatorului și URL-ul.
    *   Efectuează apelul asincron `await client.aio.models.generate_content(...)`.

5.  **Finalizarea Sarcinii (Backend, în fundal):**
    *   **În caz de succes:** La primirea unui răspuns valid de la Gemini, funcția de background procesează rezultatul (ex: extrage textul și imaginea), actualizează înregistrarea din baza de date cu starea `COMPLETED` și salvează rezultatul final într-un câmp dedicat (ex: un câmp JSONB).
    *   **În caz de eroare:** Dacă apelul la Gemini eșuează, funcția de background prinde excepția, actualizează starea sarcinii la `FAILED` și salvează mesajul de eroare în baza de date.

6.  **Sondare (Polling) pentru Stare (Frontend -> Backend):**
    *   După primirea răspunsului `202` cu `task_id`, Frontend-ul începe să interogheze periodic (ex: la fiecare 3-5 secunde) un endpoint de stare, de exemplu `GET /api/v1/tasks/{task_id}`.
    *   Acest endpoint pur și simplu citește starea sarcinii din baza de date și o returnează.

7.  **Livrarea Rezultatului (Backend -> Frontend):**
    *   Atâta timp cât starea este `PENDING` sau `PROCESSING`, endpoint-ul de stare va returna aceste informații.
    *   Când Frontend-ul face o cerere de sondare și endpoint-ul de stare găsește în baza de date starea `COMPLETED` sau `FAILED`, acesta returnează un răspuns `200 OK` care conține starea finală și rezultatul complet (sau mesajul de eroare).
    *   La primirea unui status final, Frontend-ul oprește sondarea și afișează rezultatul utilizatorului.

Această arhitectură este robustă, scalabilă și simplă, eliminând componentele complexe și punctele de eșec ale sistemului anterior.
Secțiunea 4: Concluzii și Plan de Acțiune ImediatSinteza RecomandărilorAnaliza aprofundată a condus la un set de concluzii strategice clare, care validează parțial ipoteza inițială, dar o corectează pentru a asigura robustețea în producție.Validare Parțială a Ipotezei: Ipoteza fundamentală, conform căreia capabilitățile native ale API-ului Google Gemini pot simplifica dramatic arhitectura, este confirmată. Uneltele integrate pentru generarea de JSON structurat (response_schema), analiza de surse externe (File API, grounding) și generarea multimodală (text + imagine) elimină necesitatea unor straturi întregi de cod personalizat pentru scraping, parsare și orchestrare multi-serviciu. Aceasta reprezintă o reducere semnificativă a complexității și a suprafeței de atac pentru bug-uri.Corecție Strategică: Ipoteza secundară, conform căreia un simplu apel await direct într-un endpoint API poate înlocui complet sistemul de worker pentru sarcini de 10-60 de secunde, este invalidată. Această abordare, deși simplă în cod, este extrem de fragilă într-un mediu de producție din cauza riscului iminent de timeout-uri la nivel de infrastructură (load balancers, proxy-uri).Calea Recomandată: Arhitectura optimă pentru stadiul de MVP, care echilibrează simplitatea, robustețea și viteza de dezvoltare, este una bazată pe FastAPI cu BackgroundTasks native. Aceasta este cuplată cu un model de interacțiune client-server bazat pe sondare (polling), folosind un task_id. Această soluție elimină dependențele complexe (Redis, proces Worker separat) fără a sacrifica robustețea sistemului în fața cererilor de lungă durată.Plan de Acțiune în 5 PașiPentru a ieși din "debug hell" și a implementa noua arhitectură, se recomandă următorul plan de acțiune, prioritizat:Refactorizarea Arhitecturii de Bază (Prioritate Maximă):Eliminați complet dependențele de redis și codul asociat worker-ului Celery din proiect.Modificați endpoint-urile principale care inițiază sarcini de lungă durată pentru a urma modelul "Acceptă Imediat, Procesează în Fundal" descris în Secțiunea 3.Implementați tabela tasks în baza de date și endpoint-ul de stare GET /api/v1/tasks/{task_id} pentru a permite sondarea de către client.Implementarea Generării JSON Robuste:Identificați toate locurile unde se generează JSON și înlocuiți orice logică bazată pe prompt engineering cu apeluri care folosesc response_schema.Definiți structurile JSON dorite folosind modele Pydantic pentru a beneficia de siguranța tipurilor end-to-end.Integrarea Analizei de Surse Externe:Eliminați orice cod personalizat pentru scraping de URL-uri sau parsare de fișiere PDF.Refactorizați funcționalitatea pentru a utiliza direct prompturi compozite care includ URL-uri și referințe la fișiere încărcate prin Gemini File API.Integrarea Generării Vizuale:Implementați funcționalitatea de generare combinată de text și imagine, folosind parametrul response_modalities în configurația apelului Gemini.Asigurați-vă că logica de procesare a răspunsului poate gestiona corect răspunsurile multi-part.Actualizarea Documentației și Alinierea Echipei:Înlocuiți conținutul fișierului architecture.md existent cu noul blueprint furnizat în acest raport.Organizați o ședință tehnică pentru a prezenta noua arhitectură și noul flux de date echipei de dezvoltare, asigurând o înțelegere comună și o tranziție lină.