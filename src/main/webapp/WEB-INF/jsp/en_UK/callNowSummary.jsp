<!--English->
<%@ page language="java" %>
<%@ include file="/WEB-INF/jsp/taglibs.jsp" %>

<head>
    <script type="text/javascript" src="http://maps.googleapis.com/maps/api/js?key=AIzaSyBV3hoZjKpsmV0HYAICzvct4rIwSIG2I-8&language=<locale:language/>&sensor=false"></script>
    <script type="text/javascript" src="${resources}/script/orders.js"></script>
    <script type="text/javascript" src="${resources}/script/validation.js"></script>
    <script type="text/javascript" src="${resources}/script/validation/validators_${validatorLocale}.js"></script>
    <script type="text/javascript" src="${resources}/script/ordersummary.js"></script>
    <script type="text/javascript" src="${resources}/script/callnowsummary.js"></script>


    <link rel="stylesheet" type="text/css" media="all" href="${resources}/css/callnow.css"/>
    <link rel="stylesheet" type="text/css" media="all" href="${resources}/css/ordersummary.css"/>
    <link rel="stylesheet" type="text/css" media="all" href="${resources}/css/orders.css"/>

    <title>LlamaryComer | <message:message key="page-title.call-now-order" escape="false"/></title>
</head>

<body>

<%@ include file="/WEB-INF/jsp/header.jsp" %>

<script type="text/javascript">
    var completedorderid = '${completedorderid}';
    var coordinates=[${order.restaurant.coordinates}];
</script>

<div id="content">

    <div class="content-wrapper">
        <table width="1020">
            <tr valign="top">
                <!-- Order summary -->
                <td width="760">
                    <div class="order-summary-wrapper">
                        <h2>Thank you for using <message:message key="title.companyname" escape="false"/></h2>
                        <div class="order-detail-wrapper">
                            <table width="720">
                                <tr valign="top">
                                    <!-- Order detalis -->
                                    <td width="430">
                                        <div class="order-overview-wrapper">
                                            <div class="order-detail">
                                                <div class="order-information">Your order number is ${order.orderId}</div>
                                                <div class="order-restaurant">
                                                    <util:escape value="${order.restaurant.name}"/> <util:escape value="${order.restaurant.address.summary}"/>
                                                    <div class="restaurant-contact">Contact: ${order.restaurant.notificationOptions.notificationPhoneNumber}</div>
                                                </div>
                                                <div class="order-overview">
                                                    <h2>What happens next?</h2>
                                                    <p><util:escape value="${order.restaurant.name}"/> does not take online payments. You can contact them on <util:escape value="${order.restaurant.notificationOptions.notificationPhoneNumber}"/> right now.</p>
                                                    <p><message:message key="title.companyname" escape="false"/> is currently offering a discount voucher if you complete your telephone order.</p>
                                                    <p>Enter your email address in the field below and click on <message:message key="button.call-now.send.voucher"/> button. Once your order is confirmed with <util:escape value="${order.restaurant.name}"/> you will soon receive a discount voucher.</p>
                                                    <p>Do not forget that to receive your discount voucher you will have to mention the order id above to <util:escape value="${order.restaurant.name}"/> when you phone them.<p/>.

                                                    <div class="call-now-form-entry">
                                                        <!-- Email validation error -->
                                                        <div id="mail-validation"></div>
                                                        <table width="100%">
                                                            <tr valign="top">
                                                                <td><div class="call-now-form-label"><message:message key="user.email-address"/>:<span class="required">*</span></div></td>
                                                                <td><div class="call-now-form-field"><input type="text" id="email" value=""/></div></td>
                                                                <td><span id="email-validation" class="invalid"/></td>
                                                            </tr>
                                                        </table>
                                                    </div>
                                                    <div>
                                                        <a class="call-now-nav-button call-now-nav-button-large" onclick="sendVoucher()"><message:message key="button.call-now.send.voucher"/></a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <!-- Explanation -->
                                    <td width="290">
                                        <div class="call-now-image"></div>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </td>

                <!-- Order panel -->
                <td width="260">
                    <div class="menu-right">
                        <%@ include file="/WEB-INF/jsp/order.jsp" %>
                    </div>
                </td>
            </tr>
        </table>
    </div>
</div>

<%@ include file="/WEB-INF/jsp/footer.jsp" %>

</body>
</html>
