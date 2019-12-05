if(child instanceof ProfileSummaryCard){
    childView.getElement().addClass("summary")
}

if(child instanceof SortCard){
    childView.getElement().addClass("summary sort")
}

if(child instanceof HistoryNavigationCard){
    childView.getElement().addClass("summary nav")
}