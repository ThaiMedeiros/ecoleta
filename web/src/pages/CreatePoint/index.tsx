//ChangeEvent: é o 'tipo' dos eventos de um formulário (recebe parâmetros para saber qual elemento HTML se refere).
//FormEvent ('tipos' de eventos do formulário)
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Link, useHistory } from "react-router-dom"; //useHistory: permite navegar de um componente para outro, através de linha de código, sem botão.
import { FiArrowLeft } from "react-icons/fi";
import { Map, TileLayer, Marker } from "react-leaflet";
import { LeafletMouseEvent } from "leaflet"; //tipo do evento do mapa
import axios from "axios";
import api from "../../services/api";

import "./styles.css";
import logo from "../../assets/logo.svg";

//sempre que é criado um estado (useState) para um array ou objeto:
//é necessário informar manualmente o tipo da variável que está sendo armazenada dentro do sinal: <>.

//A interface: serve para fazer uma representação de um formato que um objeto terá.
interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface IBGEUFResponse {
  sigla: string;
}

interface IBGECityResponse {
  nome: string;
}

const CreatePoint = () => {
  const [items, setItems] = useState<Item[]>([]); //o tipo desse estado é um array de Item. Indicado por: <Item[]>
  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  //armazena um objeto com o valor dos campos: input do formulário
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
  });

  const [selectedItems, setSelectedItems] = useState<number[]>([]); //armazena os itens que foram selecionados

  const [selectedUf, setSelectedUf] = useState("0"); //armazenar a uf selecionada
  const [selectedCity, setSelectedCity] = useState("0"); //armazenar a cidade selecionada

  //posição inicial no mapa, carregada de acordo com a posição do usuário
  const [initialPosition, setInitialPosition] = useState<[number, number]>([
    0,
    0,
  ]);

  //o tipo desse campo é um array, onde a primeira e segunda posição são números. E precisa ser inicializado: neste caso, com números.
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([
    0,
    0,
  ]); //posição selecionada no mapa

  const history = useHistory();

  //buscar todos os itens cadastrados
  useEffect(() => {
    api.get("items").then((response) => {
      setItems(response.data);
    });
  }, []);

  //buscar os estados brasileiros
  useEffect(() => {
    axios
      .get<IBGEUFResponse[]>(
        "https://servicodados.ibge.gov.br/api/v1/localidades/estados"
      )
      .then((response) => {
        //buscando todas as siglas dos estados
        const ufInitials = response.data.map((uf) => uf.sigla);
        setUfs(ufInitials);
      });
  }, []);

  //buscar cidades brasileiras por uf
  useEffect(() => {
    if (selectedUf === "0") {
      return;
    }

    axios
      .get<IBGECityResponse[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`
      )
      .then((response) => {
        const cityNames = response.data.map((city) => city.nome);
        setCities(cityNames);
      });
  }, [selectedUf]); //carregar as cidades, sempre que as uf mudar

  //carregar a posição inicial do usuário no mapa
  useEffect(() => {
    //buscando através das propriedades do navegador (assim que o usuário abrir a aplicação: este componente for carregado)
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      setInitialPosition([latitude, longitude]);
    });
  }, []);

  //função para 'monitorar' toda vez que a UF for selecionada
  function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
    const uf = event.target.value;
    setSelectedUf(uf);
  }

  //função para 'monitorar' toda vez que a City for selecionada
  function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
    const city = event.target.value;
    setSelectedCity(city);
  }

  //pegar ponto indicado pelo usuário ao clicar no mapa
  function handleMapClick(event: LeafletMouseEvent) {
    setSelectedPosition([event.latlng.lat, event.latlng.lng]);
  }

  //armazenar os dados digitados nos input
  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    //buscando nome e valor do input
    const { name, value } = event.target;

    //copiando os dados que já existe no objeto (...forData) e atualizando apenas o que for digitado pelo usuário
    setFormData({ ...formData, [name]: value });
  }

  //buscando os itens que foram selecionados pelo usuário
  function handleSelectItem(id: number) {
    const alreadySelected = selectedItems.findIndex((item) => item === id);

    //verificando se o item que foi clicado, já está no array: se sim, retira; se não, inclui.
    if (alreadySelected >= 0) {
      const filteredItems = selectedItems.filter((item) => item !== id);
      setSelectedItems(filteredItems);
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  }

  //cadastrar o ponto de coleta (função a ser disparada no envio do form: colocada dentro do onSubmit)
  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const { name, email, whatsapp } = formData;
    const uf = selectedUf;
    const city = selectedCity;
    const [latitude, longitude] = selectedPosition;
    const items = selectedItems;

    const data = {
      name,
      email,
      whatsapp,
      uf,
      city,
      latitude,
      longitude,
      items,
    };

    await api.post("points", data);

    alert("Ponto de coleta criado.");
    history.push("/");
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta" />

        <Link to="/">
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1>
          Cadastro do <br />
          ponto de coleta
        </h1>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da Entidade</label>
            <input
              type="text"
              name="name"
              id="name"
              onChange={handleInputChange}
            />
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                name="email"
                id="email"
                onChange={handleInputChange}
              />
            </div>

            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input
                type="text"
                name="whatsapp"
                id="whatsapp"
                onChange={handleInputChange}
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map center={initialPosition} zoom={16} onClick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={selectedPosition}></Marker>
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select
                name="uf"
                id="uf"
                value={selectedUf}
                onChange={handleSelectUf}
              >
                <option value="0">Selecione um UF</option>
                {ufs.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select
                name="city"
                id="city"
                value={selectedCity}
                onChange={handleSelectCity}
              >
                <option value="0">Selecione uma cidade</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Itens de coleta</h2>
            <span>Selecione um ou mais itens abaixo</span>
          </legend>

          <ul className="items-grid">
            {items.map((item) => (
              <li
                key={item.id}
                onClick={() => handleSelectItem(item.id)}
                className={selectedItems.includes(item.id) ? "selected" : ""}
              >
                <img src={item.image_url} alt={item.title} />
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </fieldset>

        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>
  );
};

export default CreatePoint;
