membershipRewardsMultipler = 4;
theRate = 0.003;

$(document).ready(function(){
	var d = new Date();

	$('#startDate').datepicker({
		format: 'mm/dd/yy',
		startDate: '-1m',
		defaultDate: d,
		"autoclose": true
	}).datepicker("setDate",'now');;

	$('#startingMembership, #membershipRewards').digits();
	setCalculation();
});

$.fn.digits = function() {
	return this.each(function() {
		$(this).val($(this).val().replace("$", ""));
		$(this).val($(this).val().replace("HU", ""));
		$(this).val($(this).val().replace("H", ""));
		$(this).val($(this).val().replace("U", ""));
		$(this).val($(this).val().replace(" ", ""));
		$(this).val($(this).val().replace(",", ""));
		$(this).val($(this).val().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + " HU");
	})
}

$.fn.percent = function() {
	return this.each(function() {
		$(this).val($(this).val().replace("%", ""));
		$(this).val($(this).val() + "%");
	})
}

function stripTags(input) {
	input = input.replace('$', '');
	input = input.replace(',', '');
	input = input.replace('%', '');
	input = input.replace(/,/g,"");
	return parseFloat(input);
}

function ReplaceNumberWithCommas(number) {
	//Seperates the components of the number
	var n = number.toString().split(".");
	//Comma-fies the first part
	n[0] = n[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	//Combines the two sections
	return n.join(".");
}

function setCalculation(){
	$('.loading').show();
	$('.errorDiv').remove();
	var startDate = $('#startDate').val();
	var startingMembership = stripTags($('#startingMembership').val());
	startingMembership = parseInt(startingMembership);
	if(startingMembership < 300){
		$('#startingMembership').parent().append('<span class="errorDiv fnt-red">Please enter value greater than 300.</span>');
		return false;
	}
	else{
		var membershipRewards = parseInt(startingMembership) * membershipRewardsMultipler;
		$('#membershipRewards').val(membershipRewards).digits();
		var bonus = startingMembership * theRate;
		var rewardArr = calcRewards(bonus, startDate, startingMembership, membershipRewards);
		$('.rewardTable').html('');
		var appendContent = '';
		$.each(rewardArr, function(key, value) {
			if (key > 0) {
				var amount = parseFloat(value.amount).toFixed(2);
				var daily_reward = parseFloat(value.daily_reward).toFixed(2);
				var daily_running_bonus = parseFloat(value.daily_running_bonus).toFixed(2);
				var rebuy = parseFloat(value.rebuy).toFixed(2);
				var membership_running_bonus = parseFloat(value.membership_running_bonus).toFixed(2);
				appendContent += '<tr>\
					<td>' + value.day + '</td>\
					<td>' + value.month + '</td>\
					<td>' + value.date + '</td>\
					<td>' + amount.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + ' HU</td>\
					<td>' + daily_reward.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + ' HU</td>\
					<td>' + daily_running_bonus.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + ' HU</td>\
					<td>' + (rebuy > 0 ? '<span class="fnt-red">'+rebuy.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")+' HU</span>' : "0.00 HU") + '</td>\
					<td>' + membership_running_bonus.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + ' HU</td>\
				  </tr>';
			}
		});
		$('.rewardTable').append(appendContent);
	}
	setTimeout(function(){$('.loading').hide();}, 1000);
}

function calcRewards(bonus, myDate, startingMembership, membershipRewards){
	var arrValues = [];
	var ribeye = 125;
	var rebuyPrev = 0;
	var decimalVal = 0.0;
	var dailyBonusRaw = startingMembership * theRate;
	var amount = startingMembership.toFixed(2);
	var amount2 = amount;
	dailyBonus = dailyBonusRaw.toFixed(2);
	var rebuy = 0;
	myDate = new Date(myDate);
	myDate = getNewDate(myDate);
	var membershipRewardAmount = membershipRewards - dailyBonus;
	
	if(dailyBonus >= ribeye){
		var ribVal = dailyBonus / ribeye;
		ribVal = parseInt(ribVal);
		var ribeyeFactor = (ribeye * ribVal);
		rebuy = ribeyeFactor;
	}else if(runningBonus < ribeye){
		rebuy = 0;
	}
	rebuyPrev = rebuy;
	
	if(rebuyPrev >= ribeye){
		membershipRewardAmount = membershipRewardAmount + (rebuyPrev * membershipRewardsMultipler);	
	}
	
	var ribdiff = dailyBonus - rebuy;
	var runningBonus = parseFloat(dailyBonus);
	arrValues[1] = {
		'day': 1,
		'month': decimalVal,
		'date': myDate,
		'amount': amount,
		'daily_reward': dailyBonus,
		'daily_running_bonus': dailyBonus,
		'rebuy': (rebuy >= 0 ? rebuy : 0),
		'membership_running_bonus': membershipRewardAmount.toFixed(2)
	};
	decimalVal = decimalVal + 0.1;
	var checkIncrement = 0;
	var myArr = [36, 111, 183, 255, 330, 402, 477, 549];
	var x = 1;
	for(var i=2;i<=600;i++){
		x++;
		var count = x - 2;
		if(checkIncrement == 1){
			x--;
			checkIncrement = 0;
			decimalVal = decimalVal + 0.1;
			decimalVal = Math.round(decimalVal * 10) / 10;
		}
		if((count %membershipRewardsMultipler == 0 && count > 1)){
			if(jQuery.inArray(count, myArr) !== -1){
				checkIncrement = 1;
				count--;
			}else{
				decimalVal = decimalVal + 0.1;
				decimalVal = Math.round(decimalVal * 10) / 10;				
			}
		}
		
		amount = parseFloat(amount) + parseFloat(rebuy);
		dailyBonus = amount * theRate;
		ribdiff = runningBonus - rebuy;
		runningBonus = dailyBonus + ribdiff;
		membershipRewardAmount = membershipRewardAmount - dailyBonus;
		
		if(runningBonus >= ribeye){
			var ribVal = runningBonus / ribeye;
			ribVal = parseInt(ribVal);
			var ribeyeFactor = (ribeye * ribVal);
			rebuy = ribeyeFactor;
		}else if(runningBonus < ribeye){
			rebuy = 0;
		}
		
		if(rebuyPrev >= ribeye){
			membershipRewardAmount = membershipRewardAmount + (rebuyPrev * membershipRewardsMultipler);	
		}
		
		rebuyPrev = rebuy;
		
		myDate = new Date(myDate);
		myDate = getNewDate(myDate);
		
		arrValues[i] = {
			'day': i,
			'month': decimalVal,
			'date': myDate,
			'amount': amount,
			'daily_reward': dailyBonus,
			'daily_running_bonus': runningBonus,
			'rebuy': (rebuy >= 0 ? rebuy : 0),
			'membership_running_bonus': membershipRewardAmount
		};
	}
	return arrValues;
}

function getNewDate(_date){
	//add a day to the date
	_date.setDate(_date.getDate() + 1);
	var day = ( '0' + (_date.getDate()) ).slice( -2 );
	var month = ( '0' + (_date.getMonth()+1) ).slice( -2 );
	var year = _date.getFullYear();
	return month+"/"+day+"/"+year;
}