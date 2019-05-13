import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import 'materialize-css/dist/css/materialize.min.css';
import {
  NavItem,
  Navbar,
  Footer,
  Button,
  Icon
} from 'react-materialize';
import M from "materialize-css";
import certifyModel from './assets/certificado_modelo.png';
const axios = require("axios");

function compileData(name, cpf, workload, team) {
  let info_name = [];
  let info_cpf = [];
  let info_work = [];
  let info_team = [];
  let info_json = [];
  let returnVal = true;
  let err = '';


  Object.values(name).map((val, idx) => {
    let temp = `{"name":"${val.trim()}"`;
    info_name.push(temp);
  })
  if (cpf != []) {
    Object.values(cpf).map((val, idx) => {
      let result = TestaCPF(val.replace(/\D/g, ""));
      let temp;
      if (result) {
        temp = `,"cpf":"${val.trim()}"`;
      } else {
        returnVal = false;
        err += `CPF ${val} inválido\n`;
      }
      info_cpf.push(temp);
    })
  }
  if (workload !== []) {
    Object.values(workload).map((val, idx) => {
      let temp = `,"workload":"${val.trim()}"`;
      info_work.push(temp);
    });
  }
  if (team !== []) {
    Object.values(team).map((val, idx) => {
      let temp = `,"team":"${val.trim()}"`;
      info_team.push(temp);
    });
  }
  for (var i in info_name) {
    let temp = `${info_name[i]}`;
    if (info_cpf[i] !== undefined) {
      temp += `${info_cpf[i]}`;
    }
    if (info_work[i] !== undefined) {
      temp += `${info_work[i]}`;
    }
    if (info_team[i] !== undefined) {
      temp += `${info_team[i]}`;
    }
    temp += "}";
    info_json.push(temp);
  };
  if (returnVal) {
    return info_json;
  } else {
    return { erro: err }
  }
}
function TestaCPF(strCPF) {
  let i;
  var Soma;
  var Resto;
  Soma = 0;
  if (strCPF === "00000000000") return false;

  for (i = 1; i <= 9; i++) Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i);
  Resto = (Soma * 10) % 11;

  if ((Resto === 10) || (Resto === 11)) Resto = 0;
  if (Resto !== parseInt(strCPF.substring(9, 10))) return false;

  Soma = 0;
  for (i = 1; i <= 10; i++) Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i);
  Resto = (Soma * 10) % 11;

  if ((Resto === 10) || (Resto === 11)) Resto = 0;
  if (Resto !== parseInt(strCPF.substring(10, 11))) return false;
  return true;
}
function maskCPF(cpf) {
  let temp = cpf;
  temp = temp.replace(/\D/g, "")
  temp = temp.replace(/(\d{3})(\d)/, "$1.$2")
  temp = temp.replace(/(\d{3})(\d)/, "$1.$2")
  temp = temp.replace(/(\d{3})(\d{1,2})$/, "$1-$2")
  return temp
}
function getWidthHeightImage(image) {
  var _URL = window.URL || window.webkitURL;
  var file, img;

  if ((file = image)) {
    return new Promise((resolve, reject) => {
      img = new Image();
      img.src = _URL.createObjectURL(file);
      img.onload = () => resolve({ width: img.width, height: img.height })
      img.onerror = reject
    })
  }

}

class App extends Component {
  constructor(props) {
    super(props);
    this.file = React.createRef();
    this.state = {
      wasValidateCode: false,
      validateCode: false,
      email: null,
      cpf: false,
      workload: false,
      team: false,
      person: [
        { name: null, cpf: null, time: null }
      ],
      valueInput: {
        name: [],
        cpf: [],
        workload: [],
        team: []
      },
      download: false,
      dpi: 300,

    };
  }
  invertState = (type) => {
    if (type === 'cpf') {
      this.setState({ cpf: !this.state.cpf }, () => {
        this.setState(prevState => ({
          valueInput: { ...prevState.valueInput, cpf: [] }
        }))
      })
    }
    if (type === 'workload') {
      this.setState({ workload: !this.state.workload }, () => {
        this.setState(prevState => ({
          valueInput: { ...prevState.valueInput, workload: [] }
        }))
      })
    }
    if (type === 'team') {
      this.setState({ team: !this.state.team }, () => {
        this.setState(prevState => ({
          valueInput: { ...prevState.valueInput, team: [] }
        }))
      })
    }
  }
  componentDidMount() {
    var textNeedCount = document.querySelectorAll('#input_text, #textarea1');
    var elems = document.querySelectorAll('select');
    this.select = M.FormSelect.init(elems);
    M.CharacterCounter.init(textNeedCount)
    M.AutoInit();
  }

  removePerson = (key) => {
    let aux = [...this.state.person];
    aux.splice(key, 1);
    this.setState({ person: aux });
  }
  changeName = (key, value) => {
    let aux = [...this.state.person]
    aux[key].name = value
    this.setState({ person: aux })
    alert(Object.keys(this.state.person[key].name))
  }
  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const nameInput = target.name;
    if (nameInput[0] === 'N') {
      this.setState(prevState => ({
        valueInput: { ...prevState.valueInput, name: { ...prevState.valueInput.name, [nameInput]: value } }
      }));
    }
    if (nameInput[0] === 'C') {
      let temp = maskCPF(value);
      this.setState(prevState => ({
        valueInput: { ...prevState.valueInput, cpf: { ...prevState.valueInput.cpf, [nameInput]: temp } }
      }));
    }

    if (nameInput[0] === 'W') {
      this.setState(prevState => ({
        valueInput: { ...prevState.valueInput, workload: { ...prevState.valueInput.workload, [nameInput]: value } }
      }));
    }
    if (nameInput[0] === 'T') {
      this.setState(prevState => ({
        valueInput: { ...prevState.valueInput, team: { ...prevState.valueInput.team, [nameInput]: value } }
      }));
    }
    if (nameInput[0] === 's') {
      this.setState({ dpi: value });
    }

  }
  addPerson = (e) => {
    this.setState((prevState) => ({
      person: [...prevState.person, { name: null, cpf: null, time: null }],
    }));
  }
  handleSubmit = async e => {
    e.preventDefault();
    let { name } = this.state.valueInput;
    let { cpf } = this.state.valueInput;
    let { workload } = this.state.valueInput;
    let { team } = this.state.valueInput;
    alert(Object.keys(team))
    let info_json = compileData(name, cpf, workload, team);
    alert(info_json)
    var imageWidth;
    var imageHeight;
    await getWidthHeightImage(this.file.current.files[0])
      .then((val) => {
        imageWidth = val.width
        imageHeight = val.height
      })
    let config = {
      size: {
        x: 842,
        y: 595
      },
      margin: {
        top: 100,
        bottom: 100,
        left: 100,
        right: 100
      },
      layout: "landscape",
      dpi: this.state.dpi
    }
    //alert(Object.keys(this.file.current.files[0]))
    let content = { text: this.textarea.value, info: info_json, company: this.nameCompany.value, acessKey: this.acessKey.value }
    if (!info_json.erro) {
      if (this.file.current.files[0] && this.nameCompany.value && this.acessKey.value) {
        const formData = new FormData();
        formData.append('image', this.file.current.files[0], this.file.current.files[0].name);
        formData.set('content', JSON.stringify(content));
        formData.set('config', JSON.stringify(config));
        const configAxios = {
          responseType: 'arraybuffer',
          headers: {
            'content-type': 'multipart/form-data'
          }
        };

        // axios.post("https://api-certify.herokuapp.com/", formData, configAxios)
        axios.post("https://api-certify.herokuapp.com/", formData, configAxios)
          .then((result) => {
            var url = window.URL || window.webkitURL;
            let data = new Blob([result.data], { type: 'application/zip' });
            let zipURL = url.createObjectURL(data);
            let tempLink = document.createElement('a');
            tempLink.href = zipURL
            tempLink.setAttribute('download', `${this.nameCompany.value}.zip`)
            tempLink.click();
            this.setState({ file: result, download: true });
          }).catch((err) => {
            alert(err)
            console.log(err.result)
          })
      } else {
        if (!this.nameCompany.value) {
          alert("Preencha com um nome de Projeto/Empresa/Serviço")
        } else if (!this.acessKey.value) {
          alert("Preencha com uma chave de acesso")
        } else if (!this.file.current.files[0]) {
          alert("Preencha com uma imagem padrão")
        }
      }
    } else {
      alert(info_json.erro)
    }

  }

  render() {
    return (
      <body>
        <header className="grey darken-3">
          <Navbar brand={<a />} alignLinks="right" className="container grey darken-3">
            <NavItem onClick={() => null}>
              Getting started
            </NavItem>
            <NavItem href="components.html">
              Components
            </NavItem>
          </Navbar>

        </header>
        <main>
          <h3 className="center">Gerador de Certificados</h3>

          <div className="container">
            <div className="container">

              <hr className=" container hr_divider" />
            </div>
            <br />
            <h4 className="center">Acesso do sistema</h4>
            <div className="row" >

              <div className="row">
                <div className="input-field col s12 m6">
                  <i className="fas fa-user prefix"></i>
                  <input id="name_proj" type="text" ref={(value) => { this.nameCompany = value }} />
                  <label for="name_proj">Nome do Projeto/Empresa/Serviço</label>
                </div>

                <div className="input-field col s12 m6">
                  <i className="fas fa-key prefix"></i>
                  <input id="pass" className={`validate ${this.state.wasValidateCode ? this.state.validateCode ? "valid" : "invalid" : null}`} type="password" ref={(value) => { this.acessKey = value }} />
                  <label for="pass">Código de acesso</label>
                  <span class="helper-text" data-error="Muito Curta" required></span>
                </div>
              </div>

              <hr className="hr_divider" />

              <h4 className="center">Configuração de Imagem</h4>
              <div className="file-field input-field">
                <div className="btn">
                  <i className="fas fa-file-image"></i>
                  <span> Imagem</span>
                  <input className="validate" type="file" accept=".jpeg,.jpg,.png" ref={this.file} />
                </div>
                <div className="file-path-wrapper">
                  <input className="file-path" type="text" placeholder="Escolha a imagem padrão" />
                </div>
              </div>
              <p>A imagem deve ser de tamanho A4 e nos formatos .PNG, .JPG ou .JPEG</p>

              <div className="row">
                <div className="input-field col s12 m6">
                  <select name="selectDPI" onChange={(e) => this.handleInputChange(e)}>
                    <option value={300} selected>300 DPI</option>
                    <option value={150}>150 DPI</option>
                    <option value={96}>96 DPI</option>
                    <option value={72}>72 DPI</option>
                  </select>
                  <label>Selecione o DPI da imagem</label>
                </div>
                <div className="col s12 m6">
                  <label>Tamanho aproximado em px:</label>
                  <div className="row">
                    <div className="col s6">
                      <label>300 dpi = 2480 x 3508 px</label>
                      <br />
                      <label>96 dpi = 794 x 1123 px</label>
                    </div>
                    <div className="col s6">
                      <label>150 dpi = 1240 x 1754 px</label>
                      <br />
                      <label>72 dpi = 595 x 842 px</label>
                    </div>
                  </div>
                </div>
                <div className="center">
                  <img src={certifyModel} alt="certificado modelo" className="imgCertify" />
                </div>
              </div>

              <br />
              <hr className="hr_divider" />
              <br />


              <h4 className="center">Informações do Certificado</h4>
              <div className="input-field col s12">
                <i className="material-icons prefix">mode_edit</i>
                <textarea id="text_area" className="materialize-textarea" ref={value => { this.textarea = value }}></textarea>
                <label for="text_area">Digite o texto padrão dos certificados</label>
                <span class="helper-text" data-error="Muito Curta">Use <b>%name</b> para o nome da pessoa, <b>%cpf</b> para o CPF e <b>%time</b> para a carga horária da pessoa</span>
              </div>

              <br />
              <br />

              <div className="row">
                <div className="col s12 m4 center switchCss">
                  <p className="name_switch hide-on-med-and-down">CPF</p>
                  <div className="switch">
                    <label>
                      Off
                          <input type="checkbox" onChange={() => this.invertState('cpf')} />
                      <span className="lever"></span>
                      On
                        </label>
                  </div>
                  <p className="name_switch hide-on-med-and-up">CPF</p>
                </div>
                <div className="col s12 m4 center switchCss">
                  <p className="name_switch hide-on-med-and-down">Carga horária</p>
                  <div className="switch">
                    <label>
                      Off
                        <input type="checkbox" onChange={() => this.invertState('workload')} />
                      <span className="lever"></span>
                      On
                      </label>
                  </div>
                  <p className="name_switch hide-on-med-and-up">Carga horária</p>
                </div>
                <div className="col s12 m4 center switchCss">
                  <p className="name_switch hide-on-med-and-down">Nome equipe</p>
                  <div className="switch">
                    <label>
                      Off
                        <input type="checkbox" onChange={() => this.invertState('team')} />
                      <span className="lever"></span>
                      On
                      </label>
                  </div>
                  <p className="name_switch hide-on-med-and-up">Nome equipe</p>
                </div>
              </div>

              {this.state.person.map((value, index) => {
                let personIdName = `Name-${index}`;
                let personIdCpf = `Cpf-${index}`;
                let personIdWorkload = `Workload-${index}`;
                let personIdTeam = `Team-${index}`;
                return (
                  <div className="z-depth-1 divPerson">
                    <div className="row">
                      <div className={`input-field col s12 m${this.state.cpf ? this.state.workload ? 12 : 6 : this.state.workload ? 6 : 12}`}>
                        <i className="fas fa-user-circle prefix"></i>
                        <input
                          className={`validate ${this.state.wasValidateCode ? this.state.validateCode ? "valid" : "invalid" : null}`}
                          type="text"
                          id={personIdName}
                          data-id={index}
                          name={personIdName}
                          onChange={(e) => this.handleInputChange(e)}
                        />
                        <label for={personIdName}>{`Nome pessoa ${index + 1}`}</label>
                        <span class="helper-text" data-error="Muito Curta" required></span>
                      </div>
                      {this.state.cpf ? (
                        <div className={`input-field col s12 m${this.state.workload ? 6 : 6}`}>
                          <i className="fas fa-id-card prefix"></i>
                          <input
                            className={`validate ${this.state.wasValidateCode ? this.state.validateCode ? "valid" : "invalid" : null}`}
                            type="text"
                            id={personIdCpf}
                            data-id={index}
                            name={personIdCpf}
                            onChange={(e) => this.handleInputChange(e)}
                            maxLength={14}
                            value={this.state.valueInput.cpf[personIdCpf]}
                          />
                          <label for={personIdCpf}>CPF</label>
                          <span class="helper-text" data-error="Muito Curta">Ex.: 123.451.487-11</span>
                        </div>
                      ) : null}
                      {this.state.workload ? (
                        <div className={`input-field col s12 m${this.state.cpf ? 6 : 6}`}>
                          <i className="fas fa-hourglass-half prefix"></i>
                          <input
                            className={`validate ${this.state.wasValidateCode ? this.state.validateCode ? "valid" : "invalid" : null}`}
                            type="text"
                            id={personIdWorkload}
                            data-id={index}
                            name={personIdWorkload}
                            onChange={(e) => this.handleInputChange(e)}
                          />
                          <label for={personIdWorkload}>Carga horária</label>
                          <span class="helper-text" data-error="Muito Curta">Ex.: 10, 40 horas, 1 semana...</span>
                        </div>
                      ) : null}
                      {this.state.team ? (
                        <div className={`input-field col s12 m12`}>
                          <i className="fas fa-users prefix"></i>
                          <input
                            className={`validate ${this.state.wasValidateCode ? this.state.validateCode ? "valid" : "invalid" : null}`}
                            type="text"
                            id={personIdTeam}
                            data-id={index}
                            name={personIdTeam}
                            onChange={(e) => this.handleInputChange(e)}
                          />
                          <label for={personIdTeam}>Nome da equipe</label>
                        </div>
                      ) : null}

                    </div>
                  </div>
                )
              }
              )}
              <br />
              <br />
              <Button onClick={() => this.addPerson()} waves="light" className="right" style={{ marginBottom: 20, paddingRight: 30, paddingLeft: 30 }} >
                <i className="fas fa-plus"></i>
              </Button>
              <Button onClick={() => this.removePerson(1)} waves="light" className="right" style={{ marginBottom: 20, paddingRight: 25, paddingLeft: 25, marginRight: 20 }}>
                <i className="fas fa-user-times"></i>
              </Button>
            </div>
            <Button onClick={(e) => this.handleSubmit(e)} waves="light" className="right" style={{ marginBottom: 40 }}>
              Submit
                <Icon right>
                send
                </Icon>
            </Button>

          </div>
        </main>
        <Footer
          copyrights={<p>Desenvolvido com muito <i className="fas fa-heart"></i> por <a href="https://github.com/SerraZ3">Henrique Serra</a></p>}
          className="grey darken-3"
        >
        </Footer>

      </body>
    );
  }
}

export default App;
