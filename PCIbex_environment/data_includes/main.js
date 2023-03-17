PennController.ResetPrefix()
showProgressBar = false // removes progressbar
DebugOff()

Sequence("welcome", "practice", randomize("sprt"), "break", 
            randomize("judgement"), SendResults(), "final")

Header(
    // Declare global Var elements in which we will store the participant's info
    newVar("AGE").global(),
    newVar("SEX").global()
)
.log("age", getVar("AGE"))
.log("sex", getVar("SEX"))

newTrial("welcome",
    newHtml("form", "form.html")
    .print()
    ,
newButton("Продолжить")
        .center()
        .print()
        .wait(getHtml("form").test.complete()
          .failure(getHtml("form").warn())
          )
    ,
    getVar("AGE").set(v=>$("input[name='age']").val()), // .val() - part of JQuery to get the value of input
    // $ is a JQuery library functionality call
    // We need JQuery to extract value into the code from the html
    // input means tag <input> in the html
    // [name=''] means that we search input with such name attribute
    getVar("SEX").set(v=>$("input[name='sex']:checked").val())
    // ':checked' is used for radio buttons, we specify that we need to extract the chosen button
)

//Тренировка
newTrial("practice" ,
    // Text element at the top of the page to signal this is a practice trial
    newText("Тренировка").color("blue").print("center at 50vw","top at 1em")
    ,
    newText("expl","Сейчас мы покажем Вам пару тренировочных заданий, чтобы Вы привыкли. Сначала все слова предложения будут спрятаны за черточками. Когда вы нажмете 'пробел', появится первое слово предложения. Когда нажмете ещё раз, прочитанное слово спрячется и появится следующее. Читайте предложения целиком, после некоторых будут появляться вопросы на внимательность. Чтобы ответить на вопрос, нажимайте клавиши '1' или '2'. Переход между заданиями осуществляется автоматически.").print()
    ,
    newButton("Продолжить")
    .center().print()
    .wait().remove()
    ,
    getText("expl").remove()
    ,
    newController("sep" ,"Separator",{
     transfer: 1000, // time for break
     normalMessage: "***",
     errorMessage: "Неправильный ответ на вопрос!"
    }).center().print("center at 50vw","middle at 50vh").wait().remove()
    ,
         newController("train1", "DashedSentence", {s: "Прошлой осенью золото резко подскочило в цене."})
            .center().print("center at 50vw","middle at 50vh")
            .wait()
            .remove()
    ,
    getController("sep").center().print("center at 50vw","middle at 50vh").wait().remove()
    ,
        newController("train2","DashedSentence", {s: "Всё лето дети радостно играют в бабушкином саду."})
            .center().print("center at 50vw","middle at 50vh")
            .wait()
            .remove()
    ,
    newController("trainq","Question",{q: "Чей был сад?", as:["бабушки", "дедушки"]})
        .center().print("center at 50vw","middle at 50vh")
        .wait()
        .remove()
    ,
    getController("sep")
    ,
    newText("end_train",'Тренировка окончена. Время чтения следующих предложений будут записываться.')
    .center().print()
    ,
    newButton("Продолжить")
    .center().print()
    .wait()
)

// Чтение
Template("list_reading.csv", row =>
    newTrial("sprt"
    ,
    //Разделитель экранов
    newController("Separator",{
        transfer: 1000, // time for break
        normalMessage: "***",
        errorMessage: "Неправильный ответ на вопрос!"
    }).center().print("center at 50vw","middle at 50vh").wait().remove()
    ,
    // Стимул или филлер на чтение
    newController("DashedSentence", {s: row.sentence})
        .center().print("center at 50vw","middle at 50vh")
        .log()
        .wait()
        .remove()
    ,
    // контрольный вопрос, ЕСЛИ он есть     
    newFunction("test_quest", () => row.question == "")
        .testNot.is() // ничего не делаем, если в колонке с вопросом пусто
        .failure(
            newController("Question",
            {q: row.question, as:[row.answer_correct, row.answer_wrong],
            hasCorrect:true, randomOrder:true})
            .center().print("center at 50vw","middle at 50vh").log().wait().remove(),
            end() 
                )
    
    )
    // сохраним в итоговом файле некоторые характеристики стимулов, чтобы облегчить анализ
    .log("group", row.Group)
    .log("type", row.type)
    .log("noun", row.noun)
    .log("gender", row.gender)
    .log("case", row.case)
)

// Пауза между онлайн и офлайн частью
newTrial("break",
    newText("txt", "Вы можете взять паузу. В следующем разделе мы попросим Вас оценивать, насколько приемлемы предложения по шкале от 1 до 5. '1' означает, предложение кажется Вам плохим, '5' -- хорошим." )
    .center()
    .print()
    ,
    newButton("Продолжить")
    .center()
    .print()
    .wait()
  
)

// Оценка грамматичсности

Template("list_judgement.csv", row => // те же стимулы будем брать из другого файла, чтобы не возиться с фильтрацией филлеров

newTrial("judgement",
    newController("Separator",{
     transfer: 1000, // time for break
     normalMessage: "***"
    }).center().print("center at 50vw","middle at 50vh").wait().remove()
    ,
    
    newController("AcceptabilityJudgment",{
        s: "", // deliberately left blank; tehcnical decisions force us to put some string even when we don't need it
        q: row.sentence,// NB: you should put your stimuli in q(uestion) parameter for friendlier data sheet afterwards
        as: ['1','2','3','4','5'],
        presentAsScale: true,
        autoFirstChar : true
        //,
        //timeout: 5000 //  seconds to answer // если мы захотим суждения с ограничением по времени
            }).center().print("center at 50vw","middle at 50vh")
        .log()
        .wait()
        .remove()
    )
    // сохраним в итоговом файле некоторые характеристики стимулов, чтобы облегчить анализ
    .log("group", row.Group)
    .log("type", row.type)
    .log("noun", row.noun)
    .log("gender", row.gender)
    .log("case", row.case)
)

// A simple final screen
newTrial ( "final" ,
    newText("Эксперимент окончен, спасибо большое за участие!")
        .center().print()
    ,
    newText("Можете закрывать страницу.")
        .center().print()
    ,
    // Stay on this page forever
    newButton().wait()
)
  
