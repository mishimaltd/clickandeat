<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<%@ include file="/WEB-INF/jsp/taglibs.jsp" %>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="robots" content="all" />
    <meta http-equiv="expires" content="0">
	<link rel="shortcut icon" href="${resources}/images/favicon.png">

    <!-- Typekit -->
    <script type="text/javascript" src="//use.typekit.net/iwp4tpg.js"></script>
    <script type="text/javascript">try{Typekit.load();}catch(e){}</script>

    <!-- css -->
    <link rel="stylesheet" type="text/css" media="all" href="${resources}/css/main.css"/>
    <link rel="stylesheet" type="text/css" media="all" href="${resources}/css/header.css"/>
    <link rel="stylesheet" type="text/css" media="all" href="${resources}/css/content.css"/>
    <link rel="stylesheet" type="text/css" media="all" href="${resources}/css/footer.css"/>

    <!-- JQuery -->
    <script type="text/javascript" src="${resources}/jquery/script/jquery-1.8.0.min.js"></script>
    <script type="text/javascript" src="${resources}/jquery/script/jquery.mousewheel-3.0.6.pack.js"></script>

    <!-- Fancybox -->
    <link rel="stylesheet" href="${resources}/fancybox/source/jquery.fancybox.css?v=2.1.0" type="text/css" media="screen" />
    <script type="text/javascript" src="${resources}/fancybox/source/jquery.fancybox.pack.js?v=2.1.0"></script>

    <!-- Scripts -->
    <script type="text/javascript" src="${ctx}/script/messages.html"></script>
    <script type="text/javascript" src="${resources}/script/json2.js"></script>
    <script type="text/javascript" src="${resources}/script/tools.js"></script>

    <!-- Apply fancybox -->
    <script type="text/javascript">
	    $(document).ready(function() {
    		$(".fancybox").fancybox();
    	});
    </script>

	<decorator:head/>

    <title><decorator:title/></title>

</head>

<body>
<decorator:body/>
</body>

</html>