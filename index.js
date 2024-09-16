/* Importa as funções 'select', 'input' e 'checkbox' do módulo '@inquirer/prompts'
    Essas funções são usadas para criar prompts interativos para o usuário*/

const { select, input, checkbox } = require('@inquirer/prompts')

// Importa o módulo 'fs' com suporte a promessas para operações assíncronas de leitura e escrita de arquivos
const fs = require("fs").promises

// Inicializa a variável 'mensagem' com uma mensagem de boas-vindas
let mensagem = "Bem vido ao app de Metas";

/* Declara a variável 'metas' que será usada para armazenar as metas carregadas do arquivo JSON
    Inicialmente, 'metas' não tem um valor definido e será preenchida mais tarde*/
let metas

// Função para carregar as metas do arquivo JSON
const carregarMetas = async () => {
    try {

        // Tenta ler o arquivo metas.json e parsear o conteúdo como JSON
        const dados = await fs.readFile ("metas.json", "utf-8")
        metas = JSON.parse(dados)
    }
    catch(erro){
        
        // Se ocorrer um erro (por exemplo, arquivo não encontrado), inicializa metas como um array vazio
        metas = []
    }
}

// Função para salvar as metas no arquivo JSON
const salvarMetas = async () => {

    // Converte o array de metas para uma string JSON e escreve no arquivo metas.json
    await fs.writeFile("metas.json", JSON.stringify(metas, null, 2))
}

// Função para cadastrar uma nova meta
const cadastrarMeta = async () => {

    // Solicita ao usuário a entrada de uma nova meta
    const meta = await input({message: "Digite a meta:"})

    // Verifica se a meta está vazia e define uma mensagem de erro se necessário
    if (meta.length == 0) {
        mensagem = "A meta não pode ser vazia."
        return
    }

    // Adiciona a nova meta ao array de metas com status "não concluído"
    metas.push(
        {value: meta, checked: false}
    )

    mensagem = "Meta cadastrada com sucesso!"
}

// Função para listar e marcar/desmarcar metas
const listarMetas = async () => {

    // Verifica se há metas para listar
    if(metas.length == 0){
        mensagem = "Não existem metas!"
        return
    }
    // Exibe um menu de checkboxes para o usuário selecionar metas
    const respostas = await checkbox({
        message: "Use as setas para mudar de meta, o espaço para marcar ou desmarcar e o Enter para finalizar essa etapa",
        choices:[...metas],
        instructions: false,
    })

    // Desmarca todas as metas
    metas.forEach((m) => {
        m.checked = false
    })
    
    // Se nenhuma meta foi selecionada, define uma mensagem de erro
    if(respostas.length == 0){
        mensagem = "Nenhuma meta selecionada!"
        return
    }

    // Marca as metas selecionadas como concluídas
    respostas.forEach((resposta) =>{
        const meta = metas.find((m) => {
            return m.value == resposta
        })

        meta.checked = true
    })

    mensagem = 'Meta(s) marcada(s) como  concluída(s)'
}

// Função para exibir as metas realizadas
const metasRealizadas = async () => {

     // Verifica se há metas para mostrar
    if(metas.length == 0){
        mensagem = "Não existem metas!"
        return
    }
     // Filtra as metas que estão marcadas como concluídas
    const realizadas = metas.filter((meta) => {
        return meta.checked
    })

    // Se nenhuma meta foi realizada, define uma mensagem de erro
    if(realizadas.length == 0){
        mensagem = "Não existem metas realizadas! :("
        return
    }

    // Exibe as metas realizadas ao usuário
    await select({
        message: "Metas Realizadas " + realizadas.length,
        choices:[...realizadas]
    })
}

// Função para exibir as metas abertas
const metasAbertas = async () => {

    // Verifica se há metas para mostrar
    if(metas.length == 0){
        mensagem = "Não existem metas!"
        return
    }

    // Filtra as metas que não estão marcadas como concluídas
    const abertas = metas.filter((meta) =>{
        return meta.checked != true
    })

    // Se nenhuma meta está aberta, define uma mensagem de sucesso
    if(abertas.length == 0){
        mensagem = "Não existem metas abertas! :)"
        return
    }

    // Exibe as metas abertas ao usuário
    await select({
        message:"Metas Abertas " + abertas.length,
        choices:[...abertas]
    })
}

// Função para deletar metas selecionadas
const deletarMetas = async () => {

    // Verifica se há metas para deletar
    if(metas.length == 0){
        mensagem = "Não existem metas!"
        return
    }

    // Cria uma cópia das metas desmarcadas para exibição
    const metasDesmarcadas = metas.map((meta) => {
        return {value: meta.value, checked: false }
    })

    // Exibe um menu de checkboxes para o usuário selecionar metas a serem deletadas
    const itemsADeletar = await checkbox({
        message: "Selecionar item para deletar",
        choices: [...metasDesmarcadas],
        instructions:false,
    })

    // Se nenhuma meta foi selecionada para deletar, define uma mensagem de erro
    if(itemsADeletar.length == 0){
        mensagem = "Nenhum item para deletar!"
        return
    }

    // Remove as metas selecionadas do array de metas
    itemsADeletar.forEach((item) => {
        metas = metas.filter((meta) => {
            return meta.value != item
        })
    })
    mensagem = "Meta(s) deletada(s) com sucesso!"
}

// Função para exibir a mensagem atual
const mostrarMensagem = () => {
    console.clear();

    if(mensagem != ""){
        console.log(mensagem)
        console.log("")
        mensagem = ""
        
    }
}

// Função principal para iniciar o aplicativo
const start = async() => {
    await carregarMetas()

    while(true){
        // Exibe a mensagem atual e salva as metas no arquivo JSON
       mostrarMensagem()
       await salvarMetas()

       // Exibe o menu principal e aguarda a seleção do usuár
        const opcao =  await select({
            message: "Menu >",
            choices: [
                {
                    name: "Cadastrar meta",
                    value: "cadastrar"
                },
                {
                    name: "Listar metas",
                    value: "listar"

                },
                {
                    name: "Metas realizadas",
                    value: "realizadas"
                },
                {
                    name: "Metas abertas",
                    value: "abertas"

                },
                {
                    name: "Deletar metas",
                    value: "deletar"
                },
                {
                    name: "Sair",
                    value: "sair"
                }
            ]
        })


        // Executa a ação correspondente à opção selecionada
        switch(opcao){
            case "cadastrar":
                await cadastrarMeta()
                break
            case "listar":
                await listarMetas()
                break
            case "realizadas":
                await metasRealizadas()
                break
            case "abertas":
                await metasAbertas()
                break
            case "deletar":
                await deletarMetas()
                break
            case "sair":
                console.log("Até a próxima")
                return
        }

    }
}

// Inicia o aplicativo
start()