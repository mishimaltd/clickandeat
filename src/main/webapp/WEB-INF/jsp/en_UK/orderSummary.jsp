<%@ page language="java" %>
<%@ page contentType="text/html; charset=utf-8" %>
<%@ include file="/WEB-INF/jsp/taglibs.jsp" %>

<!doctype html>

<head>
    <link rel="stylesheet" type="text/css" media="all" href="${resources}/css/orders.css" charset="utf-8">
    <link rel="stylesheet" type="text/css" media="all" href="${resources}/css/ordersummary.css" charset="utf-8">

    <script type="text/javascript" src="http://maps.googleapis.com/maps/api/js?key=AIzaSyBV3hoZjKpsmV0HYAICzvct4rIwSIG2I-8&amp;language=<locale:language/>&amp;sensor=false"></script>
    <script type="text/javascript" src="${resources}/script/orders.js" charset="utf-8"></script>
    <script type="text/javascript" src="${resources}/script/ordersummary.js" charset="utf-8"></script>

    <title>LlamaryComer | <message:message key="page-title.order-confirmation" escape="false"/></title>
</head>

<body>

    <script type="text/javascript">
        var completedorderid = '${completedorderid}';
        var coordinates=[${order.restaurant.coordinates}];
    </script>

    <jsp:include page="/WEB-INF/jsp/header.jsp" />

    <div id="content">

        <div class="content-wrapper">
            <table width="1000">
                <tr valign="top">
                    <!-- Order summary -->
                    <td width="740">
                        <div class="order-summary-wrapper">
                            <h2>Thank you for your order</h2>
                            <div class="order-detail-wrapper">
                                <table width="700">
                                    <tr valign="top">
                                        <!-- Order detalis -->
                                        <td width="430">
                                            <div class="order-overview-wrapper">
                                                <div class="order-detail">
                                                    <div class="order-information">Your order number is ${order.orderId}</div>
                                                    <div class="order-restaurant">
                                                        <util:escape value="${order.restaurant.name}"/> <util:escape value="${order.restaurant.address.summary}"/>
                                                        <div class="restaurant-contact">Contact: ${order.restaurant.contactTelephone}</div>
                                                    </div>
                                                    <div class="order-overview">
                                                        <h2>What happens next?</h2>
                                                        <p>We are passing the details of your order to <util:escape value="${order.restaurant.name}"/> right now.
                                                        In a few moments you will receive confirmation that they have received your order.</p>
                                                        <p>If for any reason the restaurant are not able to fulfil your order we will
                                                        let you know straight away.</p>
                                                        <p>If you have any queries about your order, please contact <util:escape value="${order.restaurant.name}"/> using
                                                        the telephone number shown above, quoting your order number.</p>
                                                        <div class="delivery-time">
                                                            <c:choose>
                                                                <c:when test="${order.deliveryType == 'DELIVERY'}">
                                                                    Orders are usually delivered within ${order.restaurant.deliveryTimeMinutes} minutes.
                                                                </c:when>
                                                                <c:otherwise>
                                                                    Orders are usually ready for collection within ${order.restaurant.collectionTimeMinutes} minutes.
                                                                </c:otherwise>
                                                            </c:choose>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <!-- Explanation -->
                                        <td width="270">
                                            <div class="order-image"></div>
                                        </td>
                                    </tr>
                                    <tr valign="top">
                                        <td width="700" colspan="2">
                                            <div class="order-delivery">
                                                <c:choose>
                                                    <c:when test="${order.deliveryType == 'DELIVERY'}">
                                                        <h2>Delivery details</h2>
                                                        <p>You have chosen to have <util:escape value="${order.restaurant.name}"/> deliver your order to the following address:</p>
                                                        <div class="delivery-address">
                                                            <util:escape value="${order.deliveryAddress.displaySummary}" escapeNewLines="true"/>
                                                       </div>
                                                    </c:when>
                                                    <c:otherwise>
                                                        <h2>Collection details</h2>
                                                        <p>You have chosen to collect your order from <util:escape value="${order.restaurant.name}"/> in person.</p>
                                                        <p>The location of <util:escape value="${order.restaurant.name}"/> is shown below.</p>
                                                        <div id="restaurant-location"></div>
                                                    </c:otherwise>
                                                </c:choose>
                                            </div>
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

</body>
</html>
