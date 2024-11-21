from django import template

register = template.Library()

@register.filter
def tables_needed(number_of_people):
    return (number_of_people + 3) // 4

@register.simple_tag
def is_slot_available(event, start_time, number_of_people):
    tables_needed = (number_of_people + 3) // 4
    return event.get_available_tables(start_time) >= tables_needed