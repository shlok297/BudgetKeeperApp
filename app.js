

// Code is divided in modules like EventController , DataController and the UIController

    var budgetController =  (function () {

    var Income = function (Id , description , value) {
        this.Id = Id;
        this.description = description;
        this.value = value;
    }
    var Expence = function (Id , description , value) {
        this.Id = Id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expence.prototype.calcPercent = function (total) {
        if(total > 0){
            this.percentage = Math.round((this.value / total)* 100);
        }
        else{
            this.percentage = -1;
        }
    }

    Expence.prototype.getPercentage = function () {
        return this.percentage;
    }

    var caculateTotal = function(type){
        var sum = 0;
        data.prodList[type].forEach(function (item) {
            sum += item.value;
        })
        data.totals[type] = sum;
    }

    var data = {
        prodList:{
          inc: [],
          exp: []
        },
        totals:{
            inc:0,
            exp:0
        },
        budget:0,
        percentage:0
    }

    return {

        addItem: function (type, desc , val) {
            var newItem;
            var Id;
            if(data.prodList[type].length <= 0){
                Id = 0;
            }
            else if(data.prodList[type].length > 0) {
                Id = data.prodList[type][data.prodList[type].length - 1].Id + 1;
            }

            if(type === 'exp'){
                newItem = new Expence(Id , desc, val);
            }else if(type === 'inc'){
                newItem = new Income(Id , desc, val)
            }

            data.prodList[type].push(newItem);
            return newItem;
        },

        getBudget: function () {
            return{
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                budget: data.budget,
                percent: data.percentage
            }
        },

        deleteItem: function(type, itemId){
            var _itemId = parseInt(itemId);
            var dataList = data.prodList[type];
            var ids = dataList.map(function (item) {
                return item.Id;
            });
            var index = ids.indexOf(_itemId);
            if(index != -1){
                dataList.splice(index,1);
            }
        },

        calculateBudget: function () {
            caculateTotal('exp');
            caculateTotal('inc');
            data.budget = data.totals.inc - data.totals.exp;
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }
            else{
                data.percentage = -1;
            }
        },
        
        calculatePercentage: function () {
           
                data.prodList.exp.forEach(function (item) {
                    item.calcPercent(data.totals.inc);
                })
        },

        getPercentage: function () {
            var percentages = data.prodList.exp.map(function (item){
                return item.getPercentage();
            });
            return percentages;
        }

    }

})();


var uiController = (function () {

    var _domStrings ={
        inputType: '.add__type'  ,
        inputDesc: '.add__description' ,
        inputValue: '.add__value',
        button:'.add__btn',
        budgetValue:'.budget__value',
        budgetInc:'.budget__income--value',
        budgetExp:'.budget__expenses--value',
        budExpPer:'.budget__expenses--percentage',
        listContainer: '.container',
        percentContainer:'.item__percentage'
    }
    return{
        getInput: function () {
            try{
                return {
                    type: document.querySelector(_domStrings.inputType).value,
                    desc: document.querySelector(_domStrings.inputDesc).value,
                    value:parseFloat(document.querySelector(_domStrings.inputValue).value)
                }
            }
            catch(exception) {
                alert("Please Enter Valid Input !!");
            }

        },

        addNewItem: function (newItemObj , type) {
            var html , newHtml , className;
            if(type === 'exp'){
                className = '.expenses__list';
                html ='<div class="item clearfix" id="exp-%id%"><div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">-%val%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i>X</button></div></div></div>';
            }
            else if(type === 'inc'){
                className = '.income__list';
                html ='<div class="item clearfix" id="inc-%id%"><div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">+%val%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i>X</button></div></div></div>';
            }

            newHtml = html.replace("%id%",newItemObj.Id);
            newHtml = newHtml.replace("%desc%",newItemObj.description);
            newHtml = newHtml.replace("%val%",newItemObj.value.toFixed(2));

            document.querySelector(className).insertAdjacentHTML('beforeend' , newHtml);
        },

        clearHTMLinputs: function () {
            var fields;
            fields = document.querySelectorAll(_domStrings.inputValue + ',' +  _domStrings.inputDesc);

            var fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function (node) {
                node.value ="";
            });
            fieldsArr[0].focus();

        },
        displayBudget: function(budgetObj) {
            document.querySelector(_domStrings.budgetValue).textContent = '$ ' + budgetObj.budget.toFixed(2);
            if(budgetObj.totalInc > 0){
                document.querySelector(_domStrings.budgetInc).textContent = '$ +' + budgetObj.totalInc.toFixed(2);
            }
            else{
                document.querySelector(_domStrings.budgetInc).textContent = '$ ' + budgetObj.totalInc.toFixed(2);
            }
            if(budgetObj.totalExp > 0){
                document.querySelector(_domStrings.budgetExp).textContent = '$ -' + budgetObj.totalExp.toFixed(2);
            }
            else{
                document.querySelector(_domStrings.budgetExp).textContent = '$ ' + budgetObj.totalExp.toFixed(2);
            }


            if (budgetObj.percent > 0) {
                document.querySelector(_domStrings.budExpPer).textContent = budgetObj.percent + '%';
            }else{
                document.querySelector(_domStrings.budExpPer).textContent = '--';
            }
        },

        deleteItemUI : function (type, itemId) {
            var _itemId = parseInt(itemId);
            var element = document.getElementById(type+'-'+_itemId);
            element.parentNode.removeChild(element);

        },
        
        displayPercentage : function (percentages) {
            var expItemList = document.querySelectorAll(_domStrings.percentContainer);
            var nodeList = Array.prototype.slice.call(expItemList);
            var i = 0;
            nodeList.forEach(function (item) {
                if(percentages[i] == -1){
                    item.innerText = '--';
                }
                else {
                    item.innerText = percentages[i] + '%';
                }
                i++;
            })
        },

        getStrings: function () {
            return _domStrings;
        }
    }
})();

var dataController = (function (budgetCntrl, uiCntrl) {

    var eventListners = function () {
        var domStrings = uiCntrl.getStrings();
        document.querySelector('.add__type').addEventListener('change', function () {
            document.querySelector('.add__type').classList.toggle('red-focus');
            document.querySelector('.add__description').classList.toggle('red-focus');
            document.querySelector('.add__value').classList.toggle('red-focus');
            document.querySelector('.add__btn').classList.toggle('red');
        });

        document.querySelector(domStrings.button).addEventListener('click',controllerCode)
        document.addEventListener('keypress',function (event) {
            if(event.keyCode === 13){
                controllerCode();
            }
        })

        document.querySelector(domStrings.listContainer).addEventListener('click', removeItem);
    }

    var updateItem = function () {
        //caculates the total
        budgetCntrl.calculateBudget();

        var dataUI = budgetCntrl.getBudget();
        //updates the UI

        uiCntrl.displayBudget(dataUI);
     }

     var updatePercentages = function () {
         //calculate percentage
         budgetCntrl.calculatePercentage();
         var percentArray = budgetCntrl.getPercentage();
         //update the UI
         uiCntrl.displayPercentage(percentArray);


     }

    var controllerCode = function () {
      var input = uiCntrl.getInput();
      if(input.desc !== "" && !isNaN(input.value) && input.value !== null){
          var newItem = budgetCntrl.addItem(input.type, input.desc , input.value);
          uiCntrl.addNewItem(newItem, input.type);
          uiCntrl.clearHTMLinputs();
          updateItem();
          updatePercentages();
      }

    }


    var removeItem = function (event) {
        var Id = event.target.parentNode.parentNode.parentNode.id;
        var splitId = Id.split("-");
        var type = splitId[0];
        var itemId = splitId[1];
        //delete item from the datastructure
        budgetCntrl.deleteItem(type, itemId);
        //delete  item from the ui
        uiCntrl.deleteItemUI(type, itemId);
        //calculate the total
        updateItem()
        updatePercentages();
    }


    return{
        init:function () {
            console.log("Lets get started");
            uiCntrl.displayBudget({
                totalInc: 0,
                totalExp: 0,
                budget: 0,
                percent: 0
            });
            var date = new Date();
            document.querySelector('.budget__title--month').textContent = date.getFullYear();
            eventListners();
        }

    }
})(budgetController,uiController);

dataController.init();