const api = "https://personal-ga2xwx9j.outsystemscloud.com/TaskBoard_CS/rest/TaskBoard/";

const request = async (endpoint, method, body) => {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        },
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${api}${endpoint}`, options);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return response.json();
    }
    
    return {};
};


// Armazena as funções de requisição
const requests = {
    // Person
    GetPeople: async () => await request(`People`, "GET"),
    /*

    Example Value
    [
        {
            "Id": 1234567891234567,
            "Name": "",
            "BirthDate": "2014-12-31",
            "PhoneNumber": "",
            "Email": ""
        }
    ]

    */
    GetPersonById: async (personId) => await request(`PersonById?PersonId=${personId}`, "GET"),
    /*

    Example Value
    {
        "Id": 1234567891234567,
        "Name": "",
        "BirthDate": "2014-12-31",
        "PhoneNumber": "",
        "Email": ""
    }   
    */
    GetPersonByEmail: async (email) => await request(`GetPersonByEmail?Email=${email}`, "GET"),
    /*

    Example Value
    {
        "Id": 1234567891234567,
        "Name": "",
        "BirthDate": "2014-12-31",
        "PhoneNumber": "",
        "Email": ""
    }

    */
    GetPersonConfig: async (personId) => await request(`PersonConfigById?PersonId=${personId}`, "GET"),
    /*

    Example Value
    {
        "PersonId": 1234567891234567,
        "DefaultThemeId": 0,
        "DefaultBoardId": 1234567891234567
    }

    */
    ConfigPersonTheme: async (personId, theme) => await request(`ConfigPersonTheme`, "PATCH", {
        PersonId: personId,
        ThemeId: theme
    }),
    /*
    
    {
        "ThemeId": 0
    }

    */


    // Boards
    GetBoards: async () => {
        try {
            const response = await request(`Boards`, "GET");
            console.log('Resposta da API:', response); // Debug
            
            if (Array.isArray(response)) {
                return response.map(board => ({
                    ...board,
                    UserId: board.UserId || board.CreatedBy
                }));
            }
            return [];
        } catch (error) {
            console.error('Erro ao buscar boards:', error);
            return [];
        }
    },
    /*

    Example Value
    [
        {
            "Id": 1234567891234567,
            "Name": "",
            "Description": "",
            "HexaBackgroundCoor": "",
            "IsActive": false,
            "CreatedBy": 1234567891234567,
            "UpdatedBy": 1234567891234567
        }
    ]

    */
    GetBoardById: async (boardId) => await request(`Board?BoardId=${boardId}`, "GET"),
    /*

    Example Value
    {
        "Id": 1234567891234567,
        "Name": "",
        "Description": "",
        "HexaBackgroundCoor": "",
        "IsActive": false,
        "CreatedBy": 1234567891234567,
        "UpdatedBy": 1234567891234567
    }

    */
    CreateBoard: async (board) => await request(`Board`, "POST", board),
    /*

    Example Value
    {
        "Id": 1234567891234567,
        "Name": "",
        "Description": "",
        "HexaBackgroundCoor": "",
        "IsActive": false,
        "CreatedBy": 1234567891234567,
        "UpdatedBy": 1234567891234567
    }

    */
    UpdateBoard: async (board) => await request(`Board`, "PUT", board),
    /*

   	
    Example Value
    {
        "Id": 1234567891234567,
        "Name": "",
        "Description": "",
        "HexaBackgroundCoor": "",
        "IsActive": false,
        "CreatedBy": 1234567891234567,
        "UpdatedBy": 1234567891234567
    }

    */
    DeleteBoard: async (boardId) => await request(`Board?BoardId=${boardId}`, "DELETE"),
    /*
    Delete Board
    */

    // Columns
    GetColumnsByBoardId: async (boardId) => {
        try {
            const response = await request(`ColumnByBoardId?BoardId=${boardId}`, "GET");
            return Array.isArray(response) ? response : [];
        } catch (error) {
            console.error('Erro ao buscar colunas:', error);
            return [];
        }
    },
    /*
    [
        {
            "Id": 1234567891234567,
            "BoardId": 1234567891234567,
            "Name": "",
            "Position": 0,
            "IsActive": false,
            "CreatedBy": 1234567891234567,
            "UpdatedBy": 1234567891234567
        }
    ]
    */
    CreateColumn: async (column) => await request(`Column`, "POST", column),
    /*
    Example Value
    {
        "Id": 1234567891234567,
        "BoardId": 1234567891234567,
        "Name": "",
        "Position": 0,
        "IsActive": false,
        "CreatedBy": 1234567891234567,
        "UpdatedBy": 1234567891234567
    }  
    */
    UpdateColumn: async (column) => await request(`Column`, "PUT", column),
    /*

    */
    DeleteColumn: async (columnId) => await request(`Column?ColumnId=${columnId}`, "DELETE"),

    // Tasks
    GetTasksByBoardId: async (boardId) => await request(`TasksByBoardId?BoardId=${boardId}`, "GET"),
    GetTasksByColumnId: async (columnId) => await request(`TasksByColumnId?ColumnId=${columnId}`, "GET"),
    CreateTask: async (task) => await request(`Task`, "POST", task),
    DeleteTask: async (taskId) => await request(`Task?TaskId=${taskId}`, "DELETE"),
    UpdateTask: async (task) => await request(`Task`, "PUT", task),

    // Themes
    GetThemes: async () => await request(`Themes`, "GET")
}

export default requests;