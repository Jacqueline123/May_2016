

$( document ).ready(function() {

    $('.js-menu-btn').click(function(){
        $('.header-nav').toggleClass('fixed');
        $(this).toggleClass('close');
    });


    start_timer();
});



function start_timer()
{
    var finisTime = new Date(apishopsActionDate('date'));
    var nowTime = new Date();
    var diffTime = new Date(finisTime-nowTime);
    var finishSeconds = Math.floor(diffTime.valueOf()/1000);

    var days=parseInt(finishSeconds/86400);
    var hours = parseInt(finishSeconds/3600)%24;
    var minutes = parseInt(finishSeconds/60)%60;
    var seconds = finishSeconds%60;
    if (days < 10) days = "0" + days;
    if (hours < 10) hours = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;

    days=days.toString();
    hours=days.toString();
    minutes=minutes.toString();
    seconds=seconds.toString();

    $('.h').html(hours);

    $('.m').html(minutes);

    $('.s').html(seconds);


    setTimeout(start_timer, 1000);
}
            function apishopsActionDate(type)
            {
                var currentTimestamp=new Date().getTime()

                if(typeof apishopsActionGetCookie('apishopsActionDate') == 'undefined' || currentTimestamp > parseInt(apishopsActionGetCookie('apishopsActionDate'))){
                    endTimestamp=currentTimestamp + (1 * 24 * 60 * 60 * 1000);
                    apishopsActionSetCookie('apishopsActionDate', endTimestamp);
                }else{
                    endTimestamp=parseInt(apishopsActionGetCookie('apishopsActionDate'))
                }

                if(type=='timestamp')
                    return endTimestamp;
                else if(type=='circularEnd'){
                    date=new Date(endTimestamp);
                    y=date.getFullYear();
                    d=date.getDate();
                    m=date.getMonth()+1;
                    h=date.getHours()+1;
                    mn=date.getMinutes();
                    return y+","+m+","+d+","+h+","+mn+",0";   //'2016,-6,-4,16,19,10',  //year,month,day,hour,minute,second
                }
                else if(type=='circularBegin'){
                    date=new Date();
                    y=date.getFullYear();
                    d=date.getDate();
                    m=date.getMonth()+1;
                    h=date.getHours()+1;
                    mn=date.getMinutes();
                    return y+","+m+","+d+","+h+","+mn+",0";   //'2016,-6,-4,16,19,10',  //year,month,day,hour,minute,second
                }
                else
                    return new Date(endTimestamp);
            }

            function apishopsActionGetCookie(name) {
              var matches = document.cookie.match(new RegExp(
                "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\/\+^])/g, '\$1') + "=([^;]*)"
              ));
              return matches ? decodeURIComponent(matches[1]) : undefined;
            }

            function apishopsActionSetCookie(name, value, options) {
              options = options || {};

              var expires = options.expires;

              if (typeof expires == "number" && expires) {
                var d = new Date();
                d.setTime(d.getTime() + expires*1000);
                expires = options.expires = d;
              }
              if (expires && expires.toUTCString) {
                options.expires = expires.toUTCString();
              }

              value = encodeURIComponent(value);

              var updatedCookie = name + "=" + value;

              for(var propName in options) {
                updatedCookie += "; " + propName;
                var propValue = options[propName];
                if (propValue !== true) {
                  updatedCookie += "=" + propValue;
                 }
              }

              document.cookie = updatedCookie;

              return value;
            }
            